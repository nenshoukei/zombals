import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps, Snippet } from '@nextui-org/react';
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
    <Modal
      backdrop="blur"
      isDismissable={false}
      className="max-w-[73rem]"
      scrollBehavior="outside"
      classNames={{ base: 'rounded-none sm:rounded-large mx-2 my-1 sm:mx-2 sm:my-1 lg:mx-6 lg:my-16' }}
      {...props}
    >
      <ModalContent>
        {deckId && !deck ? (
          <ModalBody>デッキが見つかりませんでした。</ModalBody>
        ) : (
          <>
            <ModalHeader className="px-4 py-2 lg:px-6 lg:py-4">{deckName ?? deck?.name}</ModalHeader>
            <ModalBody className="px-2 py-1 lg:px-6 lg:py-2">
              <div className="flex flex-wrap gap-2">
                {defIds.map((defId, index) => (
                  <ZoomableCardView key={index} cardDefId={defId} />
                ))}
              </div>
              {defIds.length === 0 && <div className="text-center text-2xl my-5">デッキにカードが追加されていません</div>}
            </ModalBody>

            {deckId ? (
              <ModalFooter className="flex items-center">
                <div className="mr-3 text-sm">デッキコード:</div>
                <Snippet hideSymbol tooltipProps={{ content: 'コピーする' }}>
                  {deckId}
                </Snippet>
                <Button className="ml-auto" variant="solid" color="default" onPress={props.onClose}>
                  閉じる
                </Button>
              </ModalFooter>
            ) : null}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
