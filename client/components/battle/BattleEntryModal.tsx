import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from '@nextui-org/react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import DeckViewModal from '#/components/deck/DeckViewModal';
import { useDeck } from '#/hooks/useDeck';
import { DeckId } from '@/types';

export type BattleEntryModalProps = Omit<ModalProps, 'children'> & {
  deckId: DeckId;
};

export default function BattleEntryModal({ deckId, ...props }: BattleEntryModalProps) {
  const { deck, isLoading } = useDeck(deckId);
  const [deckViewModalOpened, setDeckViewModalOpened] = useState(false);

  return (
    <Modal {...props}>
      <ModalContent>
        <ModalHeader>対戦を開始する</ModalHeader>
        <ModalBody>
          {isLoading ? (
            <CircularProgress />
          ) : !deck ? (
            <p>選択したデッキが見つかりません。すでに削除されている可能性があります。</p>
          ) : (
            <>
              <p>以下のデッキで対戦を開始します。</p>
              <Card shadow="md" className={`bg-white/70 bg-blend-lighten dark:bg-black/70 dark:bg-blend-darken`}>
                <CardBody>
                  <div className={`text-foreground lg:text-xl font-bold`}>{deck.name}</div>
                </CardBody>
                <CardFooter className="px-2 pb-2 pt-0 gap-2">
                  <div className="ml-auto flex items-center gap-1">
                    <Button
                      startContent={<span className="icon-[zondicons--view-tile]" />}
                      size="sm"
                      color="default"
                      variant="ghost"
                      onPress={() => setDeckViewModalOpened(true)}
                    >
                      一覧表示
                    </Button>
                    <Button
                      startContent={<span className="icon-[mdi--edit] text-2xl" />}
                      size="sm"
                      color="primary"
                      variant="ghost"
                      as={RouterLink}
                      to={`/deck/${deck.id}`}
                    >
                      編集画面
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="solid" size="lg" isDisabled={!deck}>
            このデッキで対戦を開始する
          </Button>
        </ModalFooter>

        {deck && deckViewModalOpened && <DeckViewModal isOpen deckId={deck.id} onClose={() => setDeckViewModalOpened(false)} />}
      </ModalContent>
    </Modal>
  );
}
