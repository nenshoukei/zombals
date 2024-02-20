import { Button, ButtonGroup, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DeckCopyModal from '#/components/deck/DeckCopyModal';
import DeckList, { DeckListSort, DeckListSortSelect } from '#/components/deck/DeckList';
import { AppLayout } from '#/components/layout/AppLayout';
import { PageLoading } from '#/components/layout/PageLoading';
import { useDeckList } from '#/hooks/useDeckList';

export default function DeckIndex() {
  const [deckSort, setDeckSort] = useState<DeckListSort | undefined>();
  const [deckCopyModalOpen, setDeckCopyModalOpen] = useState(false);
  const { isLoading, mutate: reloadDeckList } = useDeckList();

  if (isLoading) return <PageLoading />;
  return (
    <AppLayout>
      <div className="px-3 pb-3">
        <div className="flex flex-wrap justify-between items-center mx-5 mt-3 md:mt-5 mb-7 gap-2">
          <div className="min-w-48">
            <DeckListSortSelect
              label="並び順"
              size="sm"
              value={deckSort || ''}
              onChange={(ev) => setDeckSort(ev.target.value as DeckListSort)}
            />
          </div>

          <h1 className="text-center text-2xl">デッキリスト</h1>
          <div>
            <ButtonGroup>
              <Button color="success" startContent={<span className="icon-[mdi--plus] text-2xl" />} as={Link} to="/deck/new">
                デッキを作成する
              </Button>

              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button color="success" isIconOnly>
                    <span className="icon-[mdi--chevron-down] text-2xl" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu disallowEmptySelection aria-label="デッキ作成オプション">
                  <DropdownItem onPress={() => setDeckCopyModalOpen(true)}>デッキコードから作成...</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </ButtonGroup>
          </div>
        </div>
        <div className="flex flex-col items-center mx-5">
          <DeckList sort={deckSort} />
        </div>
      </div>

      {deckCopyModalOpen && <DeckCopyModal isOpen onClose={() => setDeckCopyModalOpen(false)} onDeckCreated={() => reloadDeckList()} />}
    </AppLayout>
  );
}
