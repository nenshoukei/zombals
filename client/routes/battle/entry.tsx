import { Button } from '@nextui-org/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import BattleEntryModal from '#/components/battle/BattleEntryModal';
import DeckList, { DeckListSort, DeckListSortSelect } from '#/components/deck/DeckList';
import { AppLayout } from '#/components/layout/AppLayout';
import { PageLoading } from '#/components/layout/PageLoading';
import { useDeckList } from '#/hooks/useDeckList';
import { DeckId } from '@/types';

export default function BattleEntry() {
  const [deckSort, setDeckSort] = useState<DeckListSort | undefined>();
  const { decks, isLoading } = useDeckList();
  const [selectedDeckId, setSelectedDeckId] = useState<DeckId | null>(null);

  const handleDeckSelect = (deckId: DeckId) => {
    setSelectedDeckId(deckId);
  };

  if (isLoading) return <PageLoading />;
  return (
    <AppLayout>
      <div className="px-3 pb-3">
        <div className="flex flex-wrap justify-between items-center mx-5 mt-3 lg:mt-5 mb-7 gap-2">
          <div className="min-w-48">
            {decks && decks.length > 0 && (
              <DeckListSortSelect
                label="並び順"
                size="sm"
                value={deckSort || ''}
                onChange={(ev) => setDeckSort(ev.target.value as DeckListSort)}
              />
            )}
          </div>

          <h1 className="flex-1 text-center text-2xl">対戦に使うデッキを選択</h1>
          <div className="lg:min-w-48">{/* justify 調節用 */}</div>
        </div>
        <div className="flex flex-col items-center mx-5">
          {decks && decks.length > 0 ? (
            <DeckList sort={deckSort} mode="select" onDeckSelected={handleDeckSelect} />
          ) : (
            <>
              <p>まだデッキが作成されていません。</p>
              <p className="mt-2">まずはデッキを作成しましょう。</p>
              <Button variant="solid" color="success" className="mt-7 text-2xl p-8 shadow-md shadow-gray-700" as={Link} to="/deck/new">
                デッキを作成する
              </Button>
            </>
          )}
        </div>
      </div>

      {selectedDeckId && <BattleEntryModal isOpen deckId={selectedDeckId} onClose={() => setSelectedDeckId(null)} />}
    </AppLayout>
  );
}
