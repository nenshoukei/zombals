import { Button } from '@nextui-org/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DeckList, { DeckListSort, DeckListSortSelect } from '#/components/deck/DeckList';
import { AppLayout } from '#/components/layout/AppLayout';

export default function DeckIndex() {
  const [deckSort, setDeckSort] = useState<DeckListSort | undefined>();

  return (
    <AppLayout>
      <div className="px-3 pb-3">
        <div className="flex flex-wrap justify-between items-center mx-5 mt-5 mb-7 gap-2">
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
            <Button color="success" startContent={<span className="icon-[mdi--plus] text-2xl" />} as={Link} to="/deck/new">
              デッキを作成する
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center mx-5">
          <DeckList sort={deckSort} />
        </div>
      </div>
    </AppLayout>
  );
}
