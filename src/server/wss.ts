import { WebSocket, WebSocketServer } from 'ws';
import { saveGameRecord } from './db';
import { Lobby, UserSender } from './lobby';
import { readSessionFromRequest, Session } from './session';
import {
  GameForbiddenOperationError,
  RequestDeniedReason,
  SocketDisconnectReason,
  UserId,
  ZombalsRequest,
  ZombalsResponse,
  zZombalsRequest,
} from '@/types';

const userToSocketMap = new Map<UserId, WebSocket>();
const userSender: UserSender = {
  sendToUser(response, userId) {
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

  const { userId } = session;

  // 配信用に WebSocket を記憶しておく
  if (userToSocketMap.has(userId)) {
    // 二重窓は不可 (新しい方を優先する)
    const oldConn = userToSocketMap.get(userId);
    oldConn?.close(400, SocketDisconnectReason.EXCLUSIVE);
  }

  userToSocketMap.set(userId, ws);
  ws.on('close', () => {
    userToSocketMap.delete(userId);
  });

  const send = (res: ZombalsResponse) => ws.send(JSON.stringify(res));

  ws.on('message', async (data) => {
    if (!session) {
      ws.close(403, SocketDisconnectReason.NOT_AUTHORIZED);
      return;
    }

    let request: ZombalsRequest;
    try {
      request = zZombalsRequest.parse(JSON.parse(data.toString()));
    } catch (e) {
      console.warn('Bad request:', data.toString(), e);
      return;
    }

    switch (request.type) {
      case 'LOBBY_ENTER': {
        const response = await lobby.playerEnter(session.userId, request);
        send(response);
        break;
      }
      case 'LOBBY_LEAVE': {
        await lobby.playerLeave(session.userId);
        ws.close(200, SocketDisconnectReason.LOBBY_LEAVE);
        break;
      }
      case 'GAME_START': {
        const response = await lobby.playerStartGame(session.userId);
        if (response.type === 'GAME_START') {
          // ゲーム参加者のもう一方にも GAME_START を送る
          const oppositeUserId = response.userIds[response.userIds.AL === session.userId ? 'BL' : 'AL'];
          const conn = userToSocketMap.get(oppositeUserId);
          if (conn) conn.send(JSON.stringify(response));
        }
        send(response);
        break;
      }
      case 'GAME_COMMAND': {
        const game = lobby.getGameForUserId(userId);
        if (game) {
          if (game.isFinished) {
            send({
              type: 'DENIED',
              reason: RequestDeniedReason.GAME_ENDED,
              commandId: request.command.id,
            });
          } else {
            try {
              game.receiveGameCommand(userId, request.command);
            } catch (e) {
              console.error('Error:', e);
              send({
                type: 'DENIED',
                reason: e instanceof GameForbiddenOperationError ? RequestDeniedReason.FORBIDDEN : RequestDeniedReason.ERROR,
                commandId: request.command.id,
              });
            }

            if (game.isFinished) {
              // ゲームが終了したら記録する
              lobby.gameEnd(game.record.id);
              saveGameRecord(game.record).catch((e) => {
                console.error('Failed to save game record:', e);
              });
            } else {
              // ゲームが終了していなければコマンド受付状態とする
              send({ type: 'READY' });
            }
          }
        } else {
          send({
            type: 'DENIED',
            reason: RequestDeniedReason.NO_GAME,
            commandId: request.command.id,
          });
        }
        break;
      }
      case 'GAME_ACTION_DEMAND': {
        const game = lobby.getGameForUserId(userId);
        if (game) {
          const position = game.record.players.AL.userId === userId ? 'AL' : 'BL';
          const actions = game.getActionsForPlayer(position, request.fromIndex, request.toIndex);
          send({
            type: 'GAME_ACTION',
            fromIndex: request.fromIndex,
            actions,
          });
        }
        break;
      }
    }
  });
});
