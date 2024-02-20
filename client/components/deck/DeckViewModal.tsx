import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps, Snippet } from '@nextui-org/react';
import ZoomableCardView from '#/components/card/ZoomableCardView';
import { useDeck } from '#/hooks/useDeck';
import { DeckId, Id } from '@/types';

export type DeckViewModalProps = Omit<ModalProps, 'children'> & {
  deckId?: DeckId;
  deckName?: string;
  cardDefIds?: Id[];
};

export default function DeckViewModal({ deckId, deckName, cardDefIds, ...props }: DeckViewModalProps) {
  const { deck, isLoading } = useDeck(deckId);

  if (isLoading) {
    return null;
  }

  const defIds = cardDefIds ?? deck?.cardDefIds;
  if (!defIds) {
    return null;
  }
  return (
    <Modal className="max-w-6xl" {...props}>
      <ModalContent>
        {deckId && !deck ? (
          <>
            <ModalBody>デッキが見つかりませんでした。</ModalBody>
          </>
        ) : (
          <>
            <ModalHeader>{deckName ?? deck?.name}</ModalHeader>
            <ModalBody>
              <div className="flex flex-wrap gap-2">
                {defIds.map((defId, index) => (
                  <ZoomableCardView key={index} cardDefId={defId} size="xs" />
                ))}
              </div>
              {defIds.length === 0 && <div className="text-center text-2xl my-5">デッキにカードが追加されていません</div>}
            </ModalBody>

            {deckId ? (
              <ModalFooter>
                <div className="flex items-center">
                  <div className="mr-3">デッキコード:</div>
                  <Snippet hideSymbol tooltipProps={{ content: 'コピーする' }}>
                    {deckId}
                  </Snippet>
                </div>
              </ModalFooter>
            ) : null}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
