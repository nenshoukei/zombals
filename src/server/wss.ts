import { WebSocket, WebSocketServer } from 'ws';
import { Lobby, UserSender } from './lobby';
import { readSessionFromRequest } from './session';
import { logger } from '@/logger';
import {
  GameForbiddenOperationError,
  RequestDeniedReason,
  Session,
  SocketDisconnectReason,
  SocketDisconnectResponse,
  UserId,
  ZombalsRequest,
  ZombalsResponse,
  zZombalsRequest,
} from '@/types';

const wssLogger = logger.child({ tag: 'wss' });

const userToSocketMap = new Map<UserId, WebSocket>();
const userSender: UserSender = {
  sendToUser(userId, response) {
    wssLogger.debug({ userId, response }, '--> Send to user');
    userToSocketMap.get(userId)?.send?.(JSON.stringify(response));
  },
};

export const lobby = new Lobby(userSender);

export const wss = new WebSocketServer({ noServer: true, path: '/ws' });

wss.on('connection', (ws, req) => {
  ws.on('error', (e) => {
    wssLogger.error({ error: e }, 'WebSocket error');
  });

  let session: Session | null | undefined;
  try {
    session = readSessionFromRequest(req);
  } catch (e) {
    wssLogger.warn({ error: e }, 'Bad session cookie received');
  }
  if (!session) {
    ws.close(403, SocketDisconnectReason.NOT_AUTHORIZED);
    return;
  }

  const { userId, name } = session;
  const userLogger = wssLogger.child({ userId });
  userLogger.debug({ userName: name }, `<-- Connected to WebSocket`);

  const send = (response: ZombalsResponse) => {
    userLogger.debug({ response }, `--> Send to user`);
    ws.send(JSON.stringify(response));
  };
  const close = (res: SocketDisconnectResponse) => {
    userLogger.debug({ reason: res.reason }, `-x- User disconnected`);
    ws.close(1000, JSON.stringify(res));
  };

  // 配信用に WebSocket を記憶しておく
  if (userToSocketMap.has(userId)) {
    // 二重窓は不可 (新しい方を優先する)
    const oldConn = userToSocketMap.get(userId)!;
    const response: SocketDisconnectResponse = {
      reason: SocketDisconnectReason.EXCLUSIVE,
      message: { ja: '他の画面で開かれました。二重で開く事はできません。' },
    };
    userLogger.debug(`--> User duplicated connection`);
    oldConn.close(1000, JSON.stringify(response));
    oldConn.removeAllListeners();
    oldConn.terminate();
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
      userLogger.warn({ request: data.toString(), error: e }, 'Bad request');
      return;
    }

    userLogger.debug({ request }, `<-- Request`);

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
      userLogger.error({ error: e, request }, 'Error while command');
      const isForbidden = e instanceof GameForbiddenOperationError;
      send({
        type: 'DENIED',
        reason: isForbidden ? RequestDeniedReason.FORBIDDEN : RequestDeniedReason.ERROR,
        message: { ja: isForbidden ? '不正な操作です。' : 'サーバーエラーが発生しました。' },
        commandId: request.type === 'GAME_COMMAND' ? request.command.id : undefined,
      });
    }
  });
});
