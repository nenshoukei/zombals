import { BadgeState, BaseBadgeDefinition, GameContext, Id, LocaleString } from '@/types';

type Storage = {
  /** 回復量 */
  amount: number;
};

export class SlimeHpHealBadge extends BaseBadgeDefinition<Storage> {
  static readonly id = 1 as Id;

  constructor() {
    super({
      id: SlimeHpHealBadge.id,
      isDescriptionMerged: true,
    });
  }

  getMergedDescription(ctx: GameContext, badges: BadgeState<Storage>[]): LocaleString | null {
    let totalAmount = 0;
    badges.forEach((badge) => (totalAmount += badge.storage.amount));
    return {
      ja: `スライム系のユニットカードを使う度 味方リーダーのHPを ${totalAmount} 回復`,
    };
  }
}
