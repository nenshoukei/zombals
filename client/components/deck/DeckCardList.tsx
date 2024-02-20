import { Tooltip } from '@nextui-org/react';
import { useMemo } from 'react';
import styles from './DeckCardList.module.css';
import CardView from '#/components/card/CardView';
import { useCurrentSesionLocale } from '#/hooks/useCurrentSession';
import { cardRegistry } from '@/registry';
import { CardDefinitionBase, CardRarity, Id } from '@/types';

export type DeckCardListProps = {
  cardDefIds: Id[];
  highlightCardDefId?: Id;
  errorCardDefId?: Id;
  canEdit?: boolean;
  onAddCard?: (cardDefId: Id) => void;
  onRemoveCard?: (cardDefId: Id) => void;
};

export default function DeckCardList({
  cardDefIds,
  highlightCardDefId,
  errorCardDefId,
  canEdit,
  onAddCard,
  onRemoveCard,
}: DeckCardListProps) {
  const locale = useCurrentSesionLocale();

  const cardDefEntries = useMemo(() => {
    const map = new Map<Id, { id: Id; count: number; def: CardDefinitionBase }>();
    cardDefIds.forEach((cardDefId) => {
      if (map.has(cardDefId)) {
        map.get(cardDefId)!.count++;
      } else {
        map.set(cardDefId, { id: cardDefId, count: 1, def: cardRegistry.getById(cardDefId) });
      }
    });
    return [...map.values()];
  }, [cardDefIds]);

  return (
    <div className={styles.container}>
      {cardDefEntries.map(({ id, count, def }) => (
        <Tooltip
          key={id}
          content={<CardView cardDefId={id} />}
          placement="left"
          classNames={{
            content: ['p-0'],
          }}
        >
          <div
            className={`${styles.item} ${highlightCardDefId === id ? styles.highlight : ''} ${errorCardDefId === id ? styles.error : ''}`}
          >
            <div className={`${styles.image}`}>
              <img src={`/assets/card/card-${id}.jpg`} className="opacity-20" />
            </div>
            <div className={styles.cost}>{def.cost}</div>
            <div className={`${styles.name}`}>{def.name[locale]}</div>
            <div className={styles.count}>{`x${count}`}</div>
            {canEdit && (
              <div className={styles.buttons}>
                <button
                  className={styles.plusButton}
                  disabled={count >= (def.rarity === CardRarity.LEGEND ? 1 : 2)}
                  onClick={onAddCard ? () => onAddCard(id) : undefined}
                  title="カードを1枚追加"
                >
                  <span className="icon-[mdi--plus]" />
                </button>
                <button className={styles.minusButton} onClick={onRemoveCard ? () => onRemoveCard(id) : undefined} title="カードを1枚削除">
                  <span className="icon-[mdi--minus]" />
                </button>
              </div>
            )}
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
