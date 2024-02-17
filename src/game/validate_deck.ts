import { cardRegistry } from '@/registry';
import { CardDefinition, CardJob, CardRarity, Id, Job, LocaleString } from '@/types';

export interface ValidateDeckSuccess {
  success: true;
}

export interface ValidateDeckFailure {
  success: false;
  message: LocaleString;
}

export type ValidateDeckResult = ValidateDeckSuccess | ValidateDeckFailure;

/**
 * デッキの内容に問題がないか検証する
 *
 * - デッキの枚数はチェックしない（不完全でも保存できる機能があるため）
 * - カードの職業が一致しているか、同じカードが 3 枚以上 (レジェンドレアは 2 枚以上) 使われていないかチェックする
 *
 * @param cardDefIds カード定義IDの配列
 * @param job 職業
 * @returns 問題がない場合は `true`
 */
export function validateDeck(cardDefIds: Id[], job: Job): ValidateDeckResult {
  const cardCounts: { [k in Id]?: number } = {};
  for (const cardDefId of cardDefIds) {
    let cardDef: CardDefinition;
    try {
      cardDef = cardRegistry.getById(cardDefId) as CardDefinition;
    } catch (e) {
      return {
        success: false,
        message: {
          ja: 'デッキに存在しないカードが含まれています',
        },
      };
    }

    if (cardDef.isToken) {
      return {
        success: false,
        message: {
          ja: '使用できないカードが含まれています',
        },
      };
    }

    if (cardDef.job !== CardJob.COMMON && cardDef.job !== job) {
      return {
        success: false,
        message: {
          ja: 'この職業では使えないカードが含まれています',
        },
      };
    }

    cardCounts[cardDefId] = (cardCounts[cardDefId] ?? 0) + 1;
    if (cardCounts[cardDefId]! >= 2 && cardDef.rarity === CardRarity.LEGEND) {
      return {
        success: false,
        message: {
          ja: '同じレジェンドレアカードが2枚以上含まれています',
        },
      };
    }
    if (cardCounts[cardDefId]! >= 3) {
      return {
        success: false,
        message: {
          ja: '同じカードが3枚以上含まれています',
        },
      };
    }
  }

  return {
    success: true,
  };
}
