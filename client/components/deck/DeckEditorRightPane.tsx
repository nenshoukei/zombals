import ky from 'ky';
import { useState } from 'react';
import DeckSaveModal from './DeckSaveModal';
import DeckCardList, { DeckCardListProps } from '#/components/deck/DeckCardList';
import ManaCurveGraph from '#/components/deck/ManaCurveGraph';
import { SaveButton, useSaveButtonState } from '#/components/form/SaveButton';
import { DECK_CARD_NUM } from '@/config/common';
import { Deck, Job } from '@/types';

export type DeckEditorRightPaneProps = Omit<DeckCardListProps, 'canEdit'> & {
  deck?: Deck;
  job: Job;
  onUpdateDeck?: (deck: Deck) => void;
};

export function DeckEditorRightPane({ deck, job, onUpdateDeck, cardDefIds, ...cardListProps }: DeckEditorRightPaneProps) {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveButtonState, setSaveButtonState] = useSaveButtonState();

  const handleSavePressed = () => {
    if (deck) {
      setSaveButtonState('submitting');
      (async () => {
        return (await ky
          .post('/api/deck/update', {
            json: {
              deckId: deck.id,
              cardDefIds,
            },
          })
          .json()) as { deck: Deck };
      })().then((res) => {
        setSaveButtonState('success');
        onUpdateDeck?.(res.deck);
      });
    } else {
      setIsSaveModalOpen(true);
    }
  };

  return (
    <div
      className={`job-bg-${job} rounded-lg bg-white/80 bg-blend-lighten dark:bg-black/80 dark:bg-blend-darken bg-no-repeat bg-bottom relative`}
    >
      <section className={`flex-shrink-0nk-0 w-60 rounded-lg p-2 h-full`}>
        <div className="sticky top-2 max-h-[100dvh] overflow-y-auto">
          <div className="flex justify-between items-center pb-2">
            <h3 className="font-bold pl-2">デッキのカード</h3>
          </div>

          <DeckCardList canEdit cardDefIds={cardDefIds} {...cardListProps} />

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

      {isSaveModalOpen && (
        <DeckSaveModal deckId={deck?.id} cardDefIds={cardDefIds} job={job} isOpen={isSaveModalOpen} onOpenChange={setIsSaveModalOpen} />
      )}
    </div>
  );
}
