import { z } from 'zod';
import { MAX_HAND } from '@/config/common';

/** 数値ID */
export const zId = z.number().int().min(1);
export type Id = number;

/** ユーザーID */
export const zUserId = z
  .string()
  .uuid()
  .refine((v): v is UserId => true);
export type UserId = string;

/** ユーザー名 */
export const zUserName = z
  .string()
  .min(1)
  .refine((v): v is UserName => true);
export type UserName = string;

/** ログインID */
export const zLoginId = z
  .string()
  .min(1)
  .refine((v): v is LoginId => true);
export type LoginId = string & { __type: 'LoginId' };

/** 生パスワード */
export const zRawPassword = z
  .string()
  .min(1)
  .refine((v): v is RawPassword => true);
export type RawPassword = string & { __type: 'RawPassword' };

/** ハッシュ化されたパスワード */
export const zHashedPassword = z
  .string()
  .min(1)
  .refine((v): v is HashedPassword => true);
export type HashedPassword = string & { __type: 'HashedPassword' };

/** タイムスタンプ (エポックミリ秒) */
export const zTimestamp = z.number().int().min(1);
export type Timestamp = number;
export const getCurrentTime = () => Date.now() as Timestamp;
export const getFutureTime = (deltaMS: number) => (Date.now() + deltaMS) as Timestamp;

/** 対応言語 */
export const zLocale = z.enum(['ja' /* , 'en' */]);
export type Locale = z.infer<typeof zLocale>;

/** 言語ごとの文字列 */
export const zLocaleString = z.object({ ja: z.string() });
export type LocaleString = Record<Locale, string>;

/** 手札のインデックス */
export type HandIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const zHandIndex = z
  .number()
  .int()
  .min(0)
  .max(MAX_HAND - 1)
  .refine((n: number): n is HandIndex => true);

/** 攻撃力やHPなどの数値 */
export const zStat = z.number().int().min(0);
/** 最大HPや最大MPの数値 */
export const zMaxStat = z.number().int().min(1);

/** カード効果選択の選択肢 */
export const zSelectOption = z.object({
  /** 選択肢に表示する画像のカード定義ID */
  cardDefId: zId,
  /** 選択肢テキスト */
  description: zLocaleString,
});
export type SelectOption = z.infer<typeof zSelectOption>;

//
// 注意: 以下の enum にメンバーを加える場合は、既存のメンバーの値が変わらないようにする事。
//       さもないと、リプレイなどが破損する可能性がある。
//

/**
 * 職業
 */
export enum Job {
  /** 戦士 */
  WARRIOR = 1,
  /** 魔法使い */
  WIZARD,
  /** 武闘家 */
  FIGHTER,
  /** 僧侶 */
  PRIEST,
  /** 商人 */
  MERCHANT,
  /** 占い師 */
  FORTUNE,
  /** 魔剣士 */
  EVIL,
  /** 盗賊 */
  THIEF,
}
export const zJob = z.nativeEnum(Job);

/** 職業リスト */
export const JOBS = [Job.WARRIOR, Job.WIZARD, Job.FIGHTER, Job.PRIEST, Job.MERCHANT, Job.FORTUNE, Job.EVIL, Job.THIEF] as const;

/** 職業名マップ */
export const jobNameMap: { [k in Job]: LocaleString } = {
  [Job.WARRIOR]: { ja: '戦士' },
  [Job.WIZARD]: { ja: '魔法使い' },
  [Job.FIGHTER]: { ja: '武闘家' },
  [Job.PRIEST]: { ja: '僧侶' },
  [Job.MERCHANT]: { ja: '商人' },
  [Job.FORTUNE]: { ja: '占い師' },
  [Job.EVIL]: { ja: '魔剣士' },
  [Job.THIEF]: { ja: '盗賊' },
};

enum CardJobCommon {
  /** 共通 */
  COMMON = 0,
}

/**
 * カードの職業 (共通 'COMMON' を含む)
 */
export type CardJob = Job | CardJobCommon;
export const CardJob = { ...Job, ...CardJobCommon };

/** カード職業リスト */
export const CARD_JOBS = [CardJobCommon.COMMON, ...JOBS] as const;

/** カード職業名マップ */
export const cardJobNameMap: { [k in CardJob]: LocaleString } = {
  ...jobNameMap,
  [CardJob.COMMON]: { ja: '共通' },
};

/**
 * カード種別
 */
export enum CardType {
  /** ユニット */
  UNIT,
  /** 特技 */
  SPELL,
  /** 武器 */
  WEAPON,
  /** ヒーロー */
  HERO,
  /** 建物 */
  BUILDING,
  /** テンションスキル */
  TENTION_SKILL = 10,
  /** ヒーロースキル */
  HERO_SKILL = 20,
  /** マスク状態 */
  MASKED = 98,
  /** ファティーグ */
  FATIGUE = 99,
}
export const zCardType = z.nativeEnum(CardType);

export const cardTypeNameMap: { [k in CardType]: LocaleString } = {
  [CardType.UNIT]: { ja: 'ユニット' },
  [CardType.SPELL]: { ja: '特技' },
  [CardType.WEAPON]: { ja: '武器' },
  [CardType.HERO]: { ja: 'ヒーロー' },
  [CardType.BUILDING]: { ja: '建物' },
  [CardType.TENTION_SKILL]: { ja: 'テンションスキル' },
  [CardType.HERO_SKILL]: { ja: 'ヒーロースキル' },
  [CardType.MASKED]: { ja: 'マスク状態' },
  [CardType.FATIGUE]: { ja: 'ファティーグ' },
};

/**
 * カードのレアリティ
 */
export enum CardRarity {
  /** ノーマル */
  NORMAL,
  /** レア */
  RARE,
  /** スーパーレア */
  SUPER_RARE,
  /** レジェンドレア */
  LEGEND,
}
export const zCardRarity = z.nativeEnum(CardRarity);

export const CARD_RARITIES = [CardRarity.NORMAL, CardRarity.RARE, CardRarity.SUPER_RARE, CardRarity.LEGEND] as const;

export const cardRarityNameMap: { [k in CardRarity]: LocaleString } = {
  [CardRarity.NORMAL]: { ja: 'ノーマル' },
  [CardRarity.RARE]: { ja: 'レア' },
  [CardRarity.SUPER_RARE]: { ja: 'スーパーレア' },
  [CardRarity.LEGEND]: { ja: 'レジェンド' },
};

/**
 * カードパック
 */
export enum CardPack {
  /** ベーシック */
  BASIC,
  /** スタンダード */
  STANDARD,
  /** 解き放たれし力の咆哮 */
  PACK1,
  /** 不死鳥と大地の鳴動 */
  PACK2,
  /** モンスターもりもり物語 */
  PACK3,
  /** 勇気の英雄譚 */
  PACK4,
  /** 小さな希望のシンフォニー */
  PACK5,
  /** 光と闇の異聞録 */
  PACK6,
  /** 一攫千金！カジノパラダイス */
  PACK7,
  /** 再会と誓いの世界 */
  PACK8,
  /** 破壊と創造のフロンティア */
  PACK9,
  /** 英雄たちの凱旋 */
  PACK10,
  /** そして伝説は高らかに */
  PACK11,
}
export const zCardPack = z.nativeEnum(CardPack);

export const CARD_PACKS = [
  CardPack.BASIC,
  CardPack.STANDARD,
  CardPack.PACK1,
  CardPack.PACK2,
  CardPack.PACK3,
  CardPack.PACK4,
  CardPack.PACK5,
  CardPack.PACK6,
  CardPack.PACK7,
  CardPack.PACK8,
  CardPack.PACK9,
  CardPack.PACK10,
  CardPack.PACK11,
] as const;

export const cardPackNameMap: { [k in CardPack]: LocaleString } = {
  [CardPack.BASIC]: { ja: 'ベーシック' },
  [CardPack.STANDARD]: { ja: 'スタンダード' },
  [CardPack.PACK1]: { ja: '解き放たれし力の咆哮' },
  [CardPack.PACK2]: { ja: '不死鳥と大地の鳴動' },
  [CardPack.PACK3]: { ja: 'モンスターもりもり物語' },
  [CardPack.PACK4]: { ja: '勇気の英雄譚' },
  [CardPack.PACK5]: { ja: '小さな希望のシンフォニー' },
  [CardPack.PACK6]: { ja: '光と闇の異聞録' },
  [CardPack.PACK7]: { ja: '一攫千金！カジノパラダイス' },
  [CardPack.PACK8]: { ja: '再会と誓いの世界' },
  [CardPack.PACK9]: { ja: '破壊と創造のフロンティア' },
  [CardPack.PACK10]: { ja: '英雄たちの凱旋' },
  [CardPack.PACK11]: { ja: 'そして伝説は高らかに' },
};

/**
 * ユニットの系統
 */
export enum UnitKind {
  /** 系統なし */
  NONE,
  /** ゾンビ系 */
  ZOMBIE,
  /** スライム系 */
  SLIME,
  /** ドラゴン系 */
  DRAGON,
  /** 魔王 */
  DEVIL,
  /** 冒険者 */
  ADVENTURER,
}
export const zUnitKind = z.nativeEnum(UnitKind);

export const UNIT_KINDS = [UnitKind.NONE, UnitKind.ZOMBIE, UnitKind.SLIME, UnitKind.DRAGON, UnitKind.DEVIL, UnitKind.ADVENTURER] as const;

export const unitKindNameMap: { [k in UnitKind]: LocaleString } = {
  [UnitKind.NONE]: { ja: '系統なし' },
  [UnitKind.ZOMBIE]: { ja: 'ゾンビ系' },
  [UnitKind.SLIME]: { ja: 'スライム系' },
  [UnitKind.DRAGON]: { ja: 'ドラゴン系' },
  [UnitKind.DEVIL]: { ja: '魔王' },
  [UnitKind.ADVENTURER]: { ja: '冒険者' },
};

/**
 * プレイヤーランク
 */
export enum PlayerRank {
  /** ブロンズ */
  BLONZE,
  /** シルバー */
  SLIVER,
  /** ゴールド */
  GOLD,
  /** プラチナ */
  PLATINUM,
  /** ダイヤ */
  DIAMOND,
}
export const zPlayerRank = z.nativeEnum(PlayerRank);

export const playerRankNameMap: { [k in PlayerRank]: LocaleString } = {
  [PlayerRank.BLONZE]: { ja: 'ブロンズ' },
  [PlayerRank.SLIVER]: { ja: 'シルバー' },
  [PlayerRank.GOLD]: { ja: 'ゴールド' },
  [PlayerRank.PLATINUM]: { ja: 'プラチナ' },
  [PlayerRank.DIAMOND]: { ja: 'ダイヤ' },
};
