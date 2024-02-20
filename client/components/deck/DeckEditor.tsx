import { Button } from '@nextui-org/react';
import { useCallback, useEffect, useState } from 'react';
import CardSearchView from '#/components/card/CardSearchView';
import { DeckEditorRightPane } from '#/components/deck/DeckEditorRightPane';
import DeckNameTitle from '#/components/deck/DeckNameTitle';
import DeckViewModal from '#/components/deck/DeckViewModal';
import { useCurrentSesionLocale } from '#/hooks/useCurrentSession';
import { sortCardDefinitionIds } from '@/definition/sort';
import { cardRegistry } from '@/registry';
import { CardRarity, Deck, Id, Job, jobNameMap } from '@/types';

export type DeckEditorProps = {
  deck?: Deck;
  job: Job;
  onUpdateDeck?: (deck: Deck) => void;
  onUpdateDeckName?: (deck: Deck) => void;
};

export function DeckEditor({ deck, job, onUpdateDeck, onUpdateDeckName }: DeckEditorProps) {
  const locale = useCurrentSesionLocale();
  const [cardDefIds, setCardDefIds] = useState<Id[]>(deck?.cardDefIds ?? []);
  const [errorCardDefId, setErrorCardDefId] = useState<Id | undefined>();
  const [highlightCardDefId, setHighlightCardDefId] = useState<Id | undefined>();
  const [viewModalOpened, setViewModalOpened] = useState(false);

  const handleAddCard = useCallback((cardDefId: Id) => {
    setCardDefIds((prev) => sortCardDefinitionIds([...prev, cardDefId]));
  }, []);

  const handleRemoveCard = useCallback((cardDefId: Id) => {
    setCardDefIds((prev) => {
      const index = prev.lastIndexOf(cardDefId);
      if (index === -1) return prev;

      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }, []);

  const handleClickCard = useCallback((cardDefId: Id) => {
    setCardDefIds((prev) => {
      const def = cardRegistry.getById(cardDefId);
      const count = prev.filter((id) => id === cardDefId).length;
      const maxCount = def.rarity === CardRarity.LEGEND ? 1 : 2;
      if (count >= maxCount) {
        setErrorCardDefId(cardDefId);
        return prev;
      }
      setHighlightCardDefId(cardDefId);
      return sortCardDefinitionIds([...prev, cardDefId]);
    });
  }, []);

  useEffect(() => {
    if (!errorCardDefId && !highlightCardDefId) return;
    const timer = setTimeout(() => {
      setHighlightCardDefId(undefined);
      setErrorCardDefId(undefined);
    }, 1000);
    return () => clearTimeout(timer);
  }, [highlightCardDefId, errorCardDefId]);

  return (
    <>
      <div className="flex items-center">
        <DeckNameTitle deckId={deck?.id} deckName={deck?.name ?? ''} onUpdate={(deck) => onUpdateDeckName?.(deck)} />
        <div className="ml-auto mr-4">
          <Button
            color="default"
            variant="ghost"
            onPress={() => setViewModalOpened(true)}
            startContent={<span className="icon-[zondicons--view-tile]" />}
          >
            デッキを一覧表示
          </Button>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="flex gap-2 mb-5">
          <section className="flex-grow">
            <CardSearchView job={job} onClickCard={handleClickCard} />
          </section>

          <DeckEditorRightPane
            deck={deck}
            job={job}
            cardDefIds={cardDefIds}
            highlightCardDefId={highlightCardDefId}
            errorCardDefId={errorCardDefId}
            onAddCard={handleAddCard}
            onRemoveCard={handleRemoveCard}
            onUpdateDeck={onUpdateDeck}
          />
        </div>
      </div>

      {viewModalOpened ? (
        <DeckViewModal
          deckId={deck?.id}
          deckName={deck?.name ?? `新しい${jobNameMap[job][locale]}デッキ`}
          cardDefIds={cardDefIds}
          isOpen
          onClose={() => setViewModalOpened(false)}
        />
      ) : null}
    </>
  );
}
