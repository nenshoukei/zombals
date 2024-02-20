import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps } from '@nextui-org/react';
import ky, { HTTPError } from 'ky';
import { useState } from 'react';
import { SaveButton, useSaveButtonState } from '#/components/form/SaveButton';
import { Deck } from '@/types';

export type DeckCopyModalProps = Omit<ModalProps, 'children'> & {
  onDeckCreated?: (deck: Deck) => void;
};

export default function DeckCopyModal({ onDeckCreated, ...modalProps }: DeckCopyModalProps) {
  const [deckId, setDeckId] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [saveButtonState, setSaveButtonState] = useSaveButtonState();

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (deckId === '') return;

    setSaveButtonState('submitting');
    (async () => {
      return (await ky.post('/api/deck/copy', { json: { deckId } }).json()) as { deck: Deck };
    })()
      .then((res) => {
        setSaveButtonState('success');
        setTimeout(() => {
          modalProps.onClose?.();
          onDeckCreated?.(res.deck);
        }, 500);
      })
      .catch((err) => {
        console.error(err);
        if (err.name === 'HTTPError') {
          const status = (err as HTTPError).response.status;
          if (status === 400) {
            setError('デッキコードが正しくありません');
            setSaveButtonState('initial');
            return;
          } else if (status === 404) {
            setError('存在しないデッキコードです');
            setSaveButtonState('initial');
            return;
          }
        }
        setSaveButtonState('error');
      });
  };

  return (
    <Modal {...modalProps}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>デッキコードから作成</ModalHeader>
          <ModalBody>
            <Input
              autoFocus
              label="デッキコード"
              placeholder="XXXXXX-XXXX-XXXX-XXXX-XXXXXX"
              variant="bordered"
              value={deckId}
              onValueChange={setDeckId}
              isInvalid={!!error}
              errorMessage={error}
            />
          </ModalBody>
          <ModalFooter>
            <SaveButton state={saveButtonState} successLabel="作成しました" color="primary" variant="solid">
              デッキを作成
            </SaveButton>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
