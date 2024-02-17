import { EvilSkill, FighterSkill, FortuneSkill, MerchantSkill, PriestSkill, ThiefSkill, WarriorSkill, WizardSkill } from '@/definition';
import { cardRegistry } from '@/registry';
import { Job, TentionSkillCardDefinition } from '@/types';

export function getTentionSkillDefByJob(job: Job): TentionSkillCardDefinition {
  switch (job) {
    case Job.WARRIOR:
      return cardRegistry.getByDef(WarriorSkill);
    case Job.WIZARD:
      return cardRegistry.getByDef(WizardSkill);
    case Job.FIGHTER:
      return cardRegistry.getByDef(FighterSkill);
    case Job.PRIEST:
      return cardRegistry.getByDef(PriestSkill);
    case Job.MERCHANT:
      return cardRegistry.getByDef(MerchantSkill);
    case Job.FORTUNE:
      return cardRegistry.getByDef(FortuneSkill);
    case Job.EVIL:
      return cardRegistry.getByDef(EvilSkill);
    case Job.THIEF:
      return cardRegistry.getByDef(ThiefSkill);
  }
}
