import { z } from 'zod';
import { Job, PlayerRank, zId, zTimestamp, zUserId, zUserName } from './common';
import { zLeaderMap, zLeaderPosition } from './field';
import { zGameAction } from './protocol/game_action';
import { DECK_CARD_NUM } from '@/config/common';

/**
 * ゲームに参加したプレイヤー情報 (ゲーム開始時点のもの)
 */
export type GamePlayer = z.infer<typeof zGamePlayer>;
export const zGamePlayer = z.object({
  /** ユーザーID */
  userId: zUserId,
  /** プレイヤー名 */
  name: zUserName,
  /** 称号ID */
  titleId: zId.nullable(),
  /** ランク */
  rank: z.nativeEnum(PlayerRank),
  /** 職業 */
  job: z.nativeEnum(Job),
  /** 使用デッキ (カード定義IDの配列) */
  cardDefIds: z.array(zId).length(DECK_CARD_NUM),
});

/** ゲーム記録ID */
export const zGameRecordId = z
  .string()
  .uuid()
  .refine((v): v is GameRecordId => true);
export type GameRecordId = string & { __type: 'GameRecordId' };

/**
 * ゲーム (1試合) の記録
 *
 * 1つのゲーム内容が完全に含まれる構造体。
 * actions を最初から実行していくとゲーム状況を完全再現できる。
 */
export type GameRecord = z.infer<typeof zGameRecord>;
export const zGameRecord = z.object({
  /** ゲームID */
  id: zGameRecordId,
  /** ゲーム開始のエポック時間 (ミリ秒) */
  startedAt: zTimestamp,
  /** ゲーム終了のエポック時間 (ミリ秒) 未終了時は null */
  finishedAt: zTimestamp.nullable(),
  /** プレイヤー情報 */
  players: zLeaderMap(zGamePlayer),
  /** 先攻プレイヤー位置 */
  first: zLeaderPosition,
  /** 勝利したプレイヤー */
  winner: zLeaderPosition.nullable(),
  /** ランダムシード */
  seed: z.number().int().min(0),
  /** ゲーム中に行われた一連のアクション */
  actions: z.array(zGameAction),
});
