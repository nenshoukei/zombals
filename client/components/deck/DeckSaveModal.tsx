import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps } from '@nextui-org/react';
import ky from 'ky';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SaveButton, useSaveButtonState } from '#/components/form/SaveButton';
import { useCurrentSesionLocale } from '#/hooks/useCurrentSession';
import { useDeck } from '#/hooks/useDeck';
import { useDeckList } from '#/hooks/useDeckList';
import { DECK_CARD_NUM } from '@/config/common';
import { DeckId, Id, Job, jobNameMap } from '@/types';

export type DeckSaveModal = Omit<ModalProps, 'children'> & {
  deckId?: DeckId;
  cardDefIds: Id[];
  job: Job;
};

export default function DeckSaveModal({ deckId, cardDefIds, job, onOpenChange, ...props }: DeckSaveModal) {
  const navigate = useNavigate();
  const locale = useCurrentSesionLocale();
  const { decks, mutate: mutateDecks } = useDeckList();
  const { deck, mutate: mutateDeck } = useDeck(deckId);
  const [name, setName] = useState('');
  const [saveButtonState, setSaveButtonState] = useSaveButtonState();

  const defaultName = useMemo(() => {
    if (deck) {
      return deck.name;
    }

    const defaultNameRE = new RegExp(`^${jobNameMap[job][locale]}デッキ([0-9]+)$`);
    let maxNumber = 1;
    if (decks) {
      for (const deck of decks) {
        const match = deck.name.match(defaultNameRE);
        if (match) {
          maxNumber = Math.max(maxNumber, Number(match[1]) + 1);
        }
      }
    }
    return `${jobNameMap[job][locale]}デッキ${maxNumber}`;
  }, [deck, decks, job]);

  const handleSave = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    (async () => {
      setSaveButtonState('submitting');
      if (deck) {
        await ky
          .post('/api/deck/update', {
            json: {
              deckId: deck.id,
              name: name || defaultName,
              cardDefIds,
            },
          })
          .json();
      } else {
        await ky
          .post('/api/deck/create', {
            json: {
              name: name || defaultName,
              job,
              cardDefIds,
            },
          })
          .json();
      }
    })()
      .then(() => {
        setSaveButtonState('success');
        mutateDecks();
        mutateDeck();
        setTimeout(() => {
          navigate('/deck');
        }, 500);
      })
      .catch((e) => {
        console.error(e);
        setSaveButtonState('error');
      });
  };

  return (
    <Modal onOpenChange={onOpenChange} {...props}>
      <ModalContent>
        <form onSubmit={handleSave}>
          <ModalHeader>デッキを保存</ModalHeader>
          <ModalBody>
            <Input
              autoFocus
              variant="bordered"
              label="デッキ名"
              labelPlacement="outside"
              size="md"
              name="deckName"
              value={name}
              onValueChange={setName}
              placeholder={defaultName}
            />

            {cardDefIds.length !== DECK_CARD_NUM ? (
              <p className="mt-2 rounded-lg bg-danger-100 p-2">
                このまま保存できますが、デッキの枚数が {DECK_CARD_NUM} 枚{cardDefIds.length < DECK_CARD_NUM ? 'に満たない' : 'を超えている'}
                ため対戦には使用できません。
              </p>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <SaveButton state={saveButtonState} className="min-w-36" />
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
