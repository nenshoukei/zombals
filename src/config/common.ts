/** デッキの枚数 */
export const DECK_CARD_NUM = 30;
/** 手札の最大枚数 */
export const MAX_HAND = 10;
/** プレイヤーの最大HP */
export const PLAYER_MAX_HP = 20;
/** テンションの最大数 */
export const MAX_TENTION = 3;

/**
 * 最初の手札の枚数
 */
export const FIRST_HAND_NUM: Record<'first' | 'second', number> = {
  first: 3,
  second: 4,
};

/** マッチングのタイムアウト時間 */
export const MATCHING_TIMEOUT_MS = 1000 * 10;
/** ゲーム開始のタイムアウト時間 */
export const ACCEPT_TIMEOUT_MS = 1000 * 10;
/** マリガンのタイムアウト時間 (ミリ秒) */
export const MULLIGAN_TIMEOUT_MS = 1000 * 10;
/** 1ターンのタイムアウト時間 (ミリ秒) */
export const TURN_TIMEOUT_MS = 1000 * 10;
