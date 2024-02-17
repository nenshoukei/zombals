import { z } from 'zod';
import { zDeckId, zId, zLocaleString, zTimestamp, zUserId } from '../common';
import { zLeaderMap } from '../field';
import { zGameAction } from './game_action';
import { zGameCommand } from './game_command';

/**
 * ロビー入室または継続リクエスト
 *
 * - 入室に成功または入室中なら `LobbyWaitingResponse` が返ってくる。
 * - すでに進行中のゲームがある場合は `LobbyMatchedResponse` が返ってくる。
 * - 入室が拒否されたら `LobbyDeniedReason` が返ってくる。
 */
export type LobbyEnterRequest = z.infer<typeof zLobbyEnterRequest>;
export const zLobbyEnterRequest = z.object({
  type: z.literal('LOBBY_ENTER'),
  /** クライアントのバージョン */
  clientVersion: z.string(),
  /** 使用デッキID */
  deckId: zDeckId,
  /** マッチングパスコード */
  passCode: z.string().min(1).optional(),
});

/**
 * ロビー退室リクエスト
 */
export type LobbyLeaveRequest = z.infer<typeof zLobbyLeaveRequest>;
export const zLobbyLeaveRequest = z.object({
  type: z.literal('LOBBY_LEAVE'),
});

/**
 * マッチング受諾してゲーム開始リクエスト
 *
 * GAME_WAITING を受けて送信する。
 * 両方のプレイヤーがこれを送信しないとゲーム開始しない。
 */
export type GameStartRequest = z.infer<typeof zGameStartRequest>;
export const zGameStartRequest = z.object({
  type: z.literal('GAME_START'),
});

/**
 * ゲームのコマンド送信リクエスト
 */
export type GameCommandRequest = z.infer<typeof zGameCommandRequest>;
export const zGameCommandRequest = z.object({
  type: z.literal('GAME_COMMAND'),
  command: zGameCommand,
});

/**
 * ゲームアクション再要求リクエスト
 */
export type GameActionDemandRequest = z.infer<typeof zGameActionDemandRequest>;
export const zGameActionDemandRequest = z.object({
  type: z.literal('GAME_ACTION_DEMAND'),
  /** 開始インデックス */
  fromIndex: z.number().int().min(0),
  /** 終了インデックス (省略時は最後まで) */
  toIndex: z.number().int().min(1).optional(),
});

/**
 * リクエストユニオン
 */
export type ZombalsRequest = z.infer<typeof zZombalsRequest>;
export const zZombalsRequest = z.discriminatedUnion('type', [
  zLobbyEnterRequest,
  zLobbyLeaveRequest,
  zGameStartRequest,
  zGameCommandRequest,
  zGameActionDemandRequest,
]);

/**
 * リクエスト不受理の理由
 */
export enum RequestDeniedReason {
  /** クライアントのバージョンが最新でない */
  VERSION_MISMATCH = 'VERSION_MISMATCH',
  /** メンテナンス中 */
  MAINTENANCE = 'MAINTENANCE',
  /** マッチング時間切れ */
  EXPIRED = 'EXPIRED',
  /** ゲームに参加していない */
  NO_GAME = 'NO_GAME',
  /** ゲーム終了済み */
  GAME_ENDED = 'GAME_ENDED',
  /** 禁止された操作 */
  FORBIDDEN = 'FORBIDDEN',
  /** サーバーエラー */
  ERROR = 'ERROR',
}

/**
 * リクエスト不受理のレスポンス
 */
export type RequestDeniedResponse = z.infer<typeof zRequestDeniedResponse>;
export const zRequestDeniedResponse = z.object({
  type: z.literal('DENIED'),
  /** リクエスト不受理の理由 */
  reason: z.nativeEnum(RequestDeniedReason),
  /** リクエスト不受理の理由メッセージ */
  message: zLocaleString,
  /** 不受理対象のコマンドID (GameCommandRequest に対する返答の場合のみ) */
  commandId: zId.optional(),
});

/**
 * マッチング待機中のレスポンス
 */
export type LobbyWaitingResponse = z.infer<typeof zLobbyWaitingResponse>;
export const zLobbyWaitingResponse = z.object({
  type: z.literal('LOBBY_WAITING'),
  /** マッチング待ちの有効時間 (エポックミリ秒) */
  waitUntil: zTimestamp,
});

/**
 * ゲーム開始待機中のレスポンス
 */
export type GameWaitingResponse = z.infer<typeof zGameWaitingResponse>;
export const zGameWaitingResponse = z.object({
  type: z.literal('GAME_WAITING'),
  /** マッチング待ちの有効時間 (エポックミリ秒) */
  waitUntil: zTimestamp,
});

/**
 * ゲーム開始レスポンス
 */
export type GameStartResponse = z.infer<typeof zGameStartResponse>;
export const zGameStartResponse = z.object({
  type: z.literal('GAME_START'),
  /** マッチングしたユーザーID */
  userIds: zLeaderMap(zUserId),
});

/**
 * ゲーム進行時のレスポンス
 */
export type GameActionResponse = z.infer<typeof zGameActionResponse>;
export const zGameActionResponse = z.object({
  type: z.literal('GAME_ACTION'),
  /** 実行された GameAction */
  actions: z.array(zGameAction),
  /** actions の全体における開始インデックス */
  fromIndex: z.number().int().min(0),
});

/**
 * コマンド受付状態のレスポンス
 */
export type GameReadyResponse = z.infer<typeof zGameReadyResponse>;
export const zGameReadyResponse = z.object({
  type: z.literal('READY'),
});

/**
 * レスポンスユニオン
 */
export type ZombalsResponse = z.infer<typeof zZombalsResponse>;
export const zZombalsResponse = z.discriminatedUnion('type', [
  zRequestDeniedResponse,
  zLobbyWaitingResponse,
  zGameWaitingResponse,
  zGameStartResponse,
  zGameActionResponse,
  zGameReadyResponse,
]);

/**
 * ソケット切断理由
 */
export enum SocketDisconnectReason {
  /** 認証されていない */
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  /** 二重に開かれた (古い方は切断) */
  EXCLUSIVE = 'EXCLUSIVE',
  /** ロビーを LEAVE した */
  LOBBY_LEAVE = 'LOBBY_LEAVE',
}

/**
 * ソケット切断時のレスポンス
 */
export type SocketDisconnectResponse = z.infer<typeof zSocketDisconnectResponse>;
export const zSocketDisconnectResponse = z.object({
  reason: z.nativeEnum(SocketDisconnectReason),
  message: zLocaleString,
});
