import { Switch, Tooltip } from '@nextui-org/react';
import { useLocalStorage } from '@uidotdev/usehooks';
import ky from 'ky';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeckSaveModal from './DeckSaveModal';
import CardSearchView from '#/components/card/CardSearchView';
import DeckCardList from '#/components/deck/DeckCardList';
import ManaCurveGraph from '#/components/deck/ManaCurveGraph';
import { SaveButton, useSaveButtonState } from '#/components/form/SaveButton';
import { useDeck } from '#/hooks/useDeck';
import { DECK_CARD_NUM } from '@/config/common';
import { cardRegistry } from '@/registry';
import { CardRarity, Deck, Id, Job } from '@/types';

export type DeckEditorProps = {
  deck?: Deck;
  job: Job;
};

export function DeckEditor({ deck, job }: DeckEditorProps) {
  const [cardDefIds, setCardDefIds] = useState<Id[]>(deck?.cardDefIds ?? []);
  const [errorCardDefId, setErrorCardDefId] = useState<Id | undefined>();
  const [highlightCardDefId, setHighlightCardDefId] = useState<Id | undefined>();
  const [isSortedByCost, setIsSortedByCost] = useLocalStorage('deckEditorIsSorted', false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveButtonState, setSaveButtonState] = useSaveButtonState();

  const { mutate: mutateDeck } = useDeck(deck?.id);
  const navigate = useNavigate();

  const handleAddCard = useCallback((cardDefId: Id) => {
    setCardDefIds((prev) => [...prev, cardDefId]);
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
      return [...prev, cardDefId];
    });
  }, []);

  const handleSortByCostChange = useCallback((checked: boolean) => {
    setIsSortedByCost(checked);
    if (checked) {
      setTimeout(() => setCardDefIds((prev) => prev), 10);
    }
  }, []);

  const handleSavePressed = () => {
    if (deck) {
      setSaveButtonState('submitting');
      (async () => {
        await ky.post('/api/deck/update', {
          json: {
            deckId: deck.id,
            cardDefIds,
          },
        });
      })().then(() => {
        setSaveButtonState('success');
        mutateDeck();
        setTimeout(() => {
          navigate('/deck');
        }, 500);
      });
    } else {
      setIsSaveModalOpen(true);
    }
  };

  useEffect(() => {
    if (!errorCardDefId && !highlightCardDefId) return;
    const timer = setTimeout(() => {
      setHighlightCardDefId(undefined);
      setErrorCardDefId(undefined);
    }, 1000);
    return () => clearTimeout(timer);
  }, [highlightCardDefId, errorCardDefId]);

  return (
    <div className="flex gap-2 mb-5">
      <section className="flex-grow">
        <CardSearchView job={job} onClickCard={handleClickCard} />
      </section>

      <div
        className={`job-bg-${job} rounded-lg bg-white/80 bg-blend-lighten dark:bg-black/80 dark:bg-blend-darken bg-no-repeat bg-bottom relative`}
      >
        <section className={`flex-shrink-0nk-0 w-60 rounded-lg p-2 h-full`}>
          <div className="sticky top-2 max-h-[100dvh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2">
              <h3 className="font-bold pl-2">デッキのカード</h3>
              <Tooltip content="コストが小さい順に並べる" placement="top" showArrow>
                <div>
                  <Switch
                    size="sm"
                    color="default"
                    thumbIcon={({ className }) => <span className={`icon-[mdi--sort-ascending] ${className}`} />}
                    isSelected={isSortedByCost}
                    onValueChange={handleSortByCostChange}
                  />
                </div>
              </Tooltip>
            </div>
            <DeckCardList
              cardDefIds={cardDefIds}
              isSortedByCost={isSortedByCost}
              highlightCardDefId={highlightCardDefId}
              errorCardDefId={errorCardDefId}
              canEdit
              onAddCard={handleAddCard}
              onRemoveCard={handleRemoveCard}
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="text-2xl pl-1">
                <span
                  className={`font-bold ${cardDefIds.length > DECK_CARD_NUM ? 'text-danger-400' : cardDefIds.length === DECK_CARD_NUM ? 'text-success-500' : ''}`}
                >
                  {cardDefIds.length}
                </span>
                {`/${DECK_CARD_NUM}`}
              </div>

              <SaveButton
                state={saveButtonState}
                successLabel="保存完了"
                type="button"
                variant="solid"
                color="primary"
                size="lg"
                onPress={handleSavePressed}
              >
                デッキを保存
              </SaveButton>
            </div>

            <div className="mt-4">
              <h3 className="font-bold px-2 pb-2">コスト分布</h3>
              <ManaCurveGraph cardDefIds={cardDefIds} />
            </div>
          </div>
        </section>
      </div>

      {isSaveModalOpen && (
        <DeckSaveModal deckId={deck?.id} cardDefIds={cardDefIds} job={job} isOpen={isSaveModalOpen} onOpenChange={setIsSaveModalOpen} />
      )}
    </div>
  );
}
