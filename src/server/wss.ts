import { WebSocket, WebSocketServer } from 'ws';
import { Lobby, UserSender } from './lobby';
import { readSessionFromRequest, Session } from './session';
import {
  RequestDeniedReason,
  SocketDisconnectReason,
  SocketDisconnectResponse,
  UserId,
  ZombalsRequest,
  ZombalsResponse,
  zZombalsRequest,
} from '@/types';

const userToSocketMap = new Map<UserId, WebSocket>();
const userSender: UserSender = {
  sendToUser(userId, response) {
    userToSocketMap.get(userId)?.send?.(JSON.stringify(response));
  },
};

export const lobby = new Lobby(userSender);

export const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, req) => {
  ws.on('error', (e) => console.error('WebSocketServer Error:', e));

  let session: Session | null | undefined;
  try {
    session = readSessionFromRequest(req);
  } catch (e) {
    console.warn('WebSocketServer Bad session cookie received:', e);
  }
  if (!session) {
    ws.close(403, SocketDisconnectReason.NOT_AUTHORIZED);
    return;
  }

  const { userId, name } = session;
  console.debug(`WebSocketServer Connected: ${userId} (${name})`);

  const send = (res: ZombalsResponse) => ws.send(JSON.stringify(res));
  const close = (res: SocketDisconnectResponse) => ws.close(1000, JSON.stringify(res));

  // 配信用に WebSocket を記憶しておく
  if (userToSocketMap.has(userId)) {
    // 二重窓は不可 (新しい方を優先する)
    const oldConn = userToSocketMap.get(userId);
    const response: SocketDisconnectResponse = {
      reason: SocketDisconnectReason.EXCLUSIVE,
      message: { ja: '他の画面で開かれました。二重で開く事はできません。' },
    };
    oldConn?.close(1000, JSON.stringify(response));
  }

  userToSocketMap.set(userId, ws);
  ws.on('close', () => {
    userToSocketMap.delete(userId);
  });

  ws.on('message', async (data) => {
    if (!session) {
      close({
        reason: SocketDisconnectReason.NOT_AUTHORIZED,
        message: { ja: '認証されていません。' },
      });
      return;
    }

    let request: ZombalsRequest;
    try {
      request = zZombalsRequest.parse(JSON.parse(data.toString()));
    } catch (e) {
      console.warn('WebSocketServer Bad message:', data.toString(), e);
      return;
    }

    console.debug('WebSocketServer Received:', request);

    try {
      switch (request.type) {
        case 'LOBBY_ENTER': {
          await lobby.playerEnter(userId, request);
          return;
        }
        case 'LOBBY_LEAVE': {
          await lobby.playerLeave(userId);
          close({
            reason: SocketDisconnectReason.LOBBY_LEAVE,
            message: { ja: 'ロビーを退室しました。' },
          });
          return;
        }
        case 'GAME_START': {
          await lobby.playerStartGame(userId);
          return;
        }
        case 'GAME_COMMAND': {
          await lobby.playerGameCommand(userId, request.command);
          return;
        }
        case 'GAME_ACTION_DEMAND': {
          await lobby.playerDemandGameAction(userId, request.fromIndex, request.toIndex);
          return;
        }
      }
    } catch (e) {
      console.error('Error:', e);
      send({
        type: 'DENIED',
        reason: RequestDeniedReason.ERROR,
        message: { ja: 'サーバーエラーが発生しました。' },
        commandId: request.type === 'GAME_COMMAND' ? request.command.id : undefined,
      });
    }
  });
});
