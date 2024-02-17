import { AttackTarget, DamageSource, LeaderCellPosition, LeaderPosition } from './field';
import { CardState, DrawnCardState, EquippedWeaponState } from './game_state';

/*
 * アニメーションはキューで管理される。
 *
 * カードを使ったり攻撃したりと操作する度にアニメーションがキューに追加される。
 * アニメーションが完了していない状態でも、仮想盤面は進めておき先行入力を可能とする。
 * （ただし、途中にユーザー入力が必要な効果が挟まった場合、先行入力はできなくなる）
 */

/**
 * アニメーション種別
 */
export enum AnimeType {
  TURN_START = 'TURN_START',
  TURN_END = 'TURN_END',
  SURRENDER = 'SURRENDER',
  EMOTE = 'EMOTE',
  DRAW = 'DRAW',
  DISCARD = 'DISCARD',
  TENTION_UP = 'TENTION_UP',
  CARD_USE = 'CARD_USE',
  ATTACK = 'ATTACK',
  GAIN_DAMAGE = 'GAIN_DAMAGE',
  GAIN_HEAL = 'GAIN_HEAL',
  EQUIP_WEAPON = 'EQUIP_WEAPON',
  BREAK_WEAPON = 'BREAK_WEAPON',
}

/**
 * アニメーションユニオン
 */
export type Anime =
  | AnimeTurnStart
  | AnimeTurnEnd
  | AnimeSurrender
  | AnimeEmote
  | AnimeDraw
  | AnimeDiscard
  | AnimeTentionUp
  | AnimeCardUse
  | AnimeAttack
  | AnimeGainDamage
  | AnimeGainHeal
  | AnimeEquipWeapon
  | AnimeBreakWeapon;

/**
 * ターン開始アニメーション
 */
export interface AnimeTurnStart {
  type: AnimeType.TURN_START;
  /** ターン開始したリーダー */
  leader: LeaderPosition;
}

/**
 * ターン終了アニメーション
 */
export interface AnimeTurnEnd {
  type: AnimeType.TURN_END;
  /** ターン終了したリーダー */
  leader: LeaderPosition;
}

/**
 * 投了アニメーション
 */
export interface AnimeSurrender {
  type: AnimeType.SURRENDER;
  /** 投了したリーダー */
  leader: LeaderPosition;
}

/**
 * エモートアニメーション
 */
export interface AnimeEmote {
  type: AnimeType.EMOTE;
  /** リーダー */
  leader: LeaderPosition;
  /** エモートID */
  emoteId: number;
}

/**
 * 山札からカードを引くアニメーション
 *
 * - 山札からカードを検索して手札に加える場合も共通
 * - 山札切れでファティーグカードを引いた場合も共通
 */
export interface AnimeDraw {
  type: AnimeType.DRAW;
  /** リーダー */
  leader: LeaderPosition;
  /** ドローしたカード */
  cards: [DrawnCardState, ...DrawnCardState[]];
}

/**
 * 手札からカードを捨てるアニメーション
 */
export interface AnimeDiscard {
  type: AnimeType.DISCARD;
  /** リーダー */
  leader: LeaderPosition;
  /** 捨てたカード */
  cards: [CardState, ...CardState[]];
}

/**
 * テンションアップアニメーション
 */
export interface AnimeTentionUp {
  type: AnimeType.TENTION_UP;
  /** テンションアップしたリーダー */
  leader: LeaderPosition;
}

/**
 * 手札からカード使用時のアニメーション
 */
export interface AnimeCardUse {
  type: AnimeType.CARD_USE;
  /** 使用したリーダー */
  leader: LeaderPosition;
  /** 使用したカード実体 */
  card: CardState;
}

/**
 * 攻撃アニメーション
 *
 * リーダーやユニットによって異なるアニメーションになる
 */
export interface AnimeAttack {
  type: AnimeType.ATTACK;
  /** 攻撃を行ったリーダーまたはユニットの位置 */
  attacker: LeaderCellPosition;
  /** 攻撃を受けたリーダーまたはユニットの位置 */
  attacked: LeaderCellPosition;
}

/**
 * 直接ダメージを受けたアニメーション
 */
export interface AnimeGainDamage {
  type: AnimeType.GAIN_DAMAGE;
  /** ダメージを受けたリーダーまたはユニットの位置 */
  target: AttackTarget;
  /** ダメージ源 */
  source: DamageSource;
}

/**
 * 回復したアニメーション
 */
export interface AnimeGainHeal {
  type: AnimeType.GAIN_HEAL;
  /** 回復したリーダーまたはユニットの位置 */
  target: AttackTarget;
  /** 回復源 */
  source: DamageSource;
}

/**
 * 武器装備のアニメーション
 */
export interface AnimeEquipWeapon {
  type: AnimeType.EQUIP_WEAPON;
  /** 装備したリーダー */
  leader: LeaderPosition;
  /** 装備した武器 */
  weapon: EquippedWeaponState;
}

/**
 * 武器破壊のアニメーション
 */
export interface AnimeBreakWeapon {
  type: AnimeType.BREAK_WEAPON;
  /** リーダー */
  leader: LeaderPosition;
  /** 破壊された武器 */
  weapon: EquippedWeaponState;
}
