import { useMemo } from 'react';
import styles from './CardView.module.css';
import CardDescription from '#/components/card/CardDescription';
import { useCurrentSesionLocale } from '#/hooks/useCurrentSession';
import { cardRegistry } from '@/registry';
import {
  BuildingCardDefinition,
  CardRarity,
  CardType,
  Id,
  LocaleString,
  UnitCardDefinition,
  UnitKind,
  unitKindNameMap,
  WeaponCardDefinition,
} from '@/types';

export type CardViewProps = {
  size?: 'sm' | 'md' | 'lg';
  cardDefId: Id;
  description?: LocaleString;
  unitPower?: number;
  unitMaxHP?: number;
  weaponPower?: number;
  weaponDurability?: number;
  buildingDurability?: number;
};

export default function CardView({
  size,
  cardDefId,
  description,
  unitPower,
  unitMaxHP,
  weaponPower,
  weaponDurability,
  buildingDurability,
}: CardViewProps) {
  const locale = useCurrentSesionLocale();
  const def = useMemo(() => cardRegistry.getById(cardDefId), [cardDefId]);

  const aSize = size ?? 'md';
  return (
    <div className={`${styles.container} ${styles[`size-${aSize}`]} ${styles[`job-${def.job}`]}`}>
      <div className={styles.image}>
        <img src={`/assets/card/card-${def.id}.jpg`} alt="" />
      </div>

      <div className={styles.cost}>{def.cost}</div>
      <div className={styles.nameContainer}>
        <div className={`${styles.rarity} ${styles[`rarity-${def.rarity}`]}`}>{def.rarity >= CardRarity.RARE ? '★' : null}</div>
        <div className={styles.name}>{def.name[locale]}</div>
      </div>
      <div className={styles.description}>
        <CardDescription>{description ? description[locale] : def.description[locale]}</CardDescription>
      </div>

      <div className={styles.footer}>
        {def.type === CardType.UNIT ? (
          <>
            <div className={styles.power}>{unitPower ?? (def as UnitCardDefinition).power}</div>
            {(def as UnitCardDefinition).kind === UnitKind.NONE ? null : (
              <div className={styles.unitKind}>{unitKindNameMap[(def as UnitCardDefinition).kind][locale]}</div>
            )}
            <div className={styles.maxhp}>{unitMaxHP ?? (def as UnitCardDefinition).maxHP}</div>
          </>
        ) : null}
        {def.type === CardType.WEAPON ? (
          <>
            <div className={styles.power}>{weaponPower ?? (def as WeaponCardDefinition).power}</div>
            <div className={styles.durability}>{weaponDurability ?? (def as WeaponCardDefinition).durability}</div>
          </>
        ) : null}
        {def.type === CardType.BUILDING ? (
          <>
            <div className={styles.buildingDurability}>{buildingDurability ?? (def as BuildingCardDefinition).durability}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}
