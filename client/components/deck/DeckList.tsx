import { Button, Card, CardBody, CardFooter, CircularProgress, Select, SelectItem, SelectProps, Tooltip } from '@nextui-org/react';
import ky from 'ky';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import DeckViewModal from '#/components/deck/DeckViewModal';
import { useDeckList } from '#/hooks/useDeckList';
import { DeckId, ListedDeck } from '@/types';

const deckListSortOptions = [
  ['新しい順', 'createdAt:desc', (a: ListedDeck, b: ListedDeck) => Date.parse(b.createdAt) - Date.parse(a.createdAt)],
  ['古い順', 'createdAt:asc', (a: ListedDeck, b: ListedDeck) => Date.parse(a.createdAt) - Date.parse(b.createdAt)],
  ['名前順', 'name:asc', (a: ListedDeck, b: ListedDeck) => a.name.localeCompare(b.name)],
  ['ジョブ順', 'job:asc', (a: ListedDeck, b: ListedDeck) => a.job - b.job],
  ['更新した順', 'updatedAt:desc', (a: ListedDeck, b: ListedDeck) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)],
] as const satisfies [string, string, (a: ListedDeck, b: ListedDeck) => number][];

export type DeckListSort = (typeof deckListSortOptions)[number][1];

export function DeckListSortSelect(props: Omit<SelectProps, 'children'>) {
  return (
    <Select {...props}>
      {deckListSortOptions.map(([label, value]) => (
        <SelectItem key={value} value={value}>
          {label}
        </SelectItem>
      ))}
    </Select>
  );
}

export type DeckListProps = {
  mode?: 'list' | 'select';
  sort?: DeckListSort;
  onDeckSelected?: (deckId: DeckId) => void;
};

export default function DeckList({ mode, sort, onDeckSelected }: DeckListProps) {
  const { decks, isLoading, mutate: mutateDecks } = useDeckList();
  const [viewDeckId, setViewDeckId] = useState<DeckId | null>(null);

  const handleRemoveDeck = (deck: ListedDeck) => {
    if (!confirm(`デッキ「${deck.name}」を削除します。\n\n本当によろしいですか？`)) return;

    (async () => {
      await ky.post('/api/deck/delete', { json: { deckId: deck.id } });
    })()
      .then(() => {
        mutateDecks();
      })
      .catch((e) => {
        console.error(e);
        alert('削除に失敗しました。すでに削除されている可能性があります。');
      });
  };

  const sortedDecks = useMemo(() => {
    if (!decks) return null;
    if (!sort || sort === 'createdAt:desc') return decks;

    const comparer = deckListSortOptions.find(([, value]) => value === sort)?.[2];
    if (!comparer) return decks;

    return [...decks].sort((a, b) => comparer(a, b));
  }, [sort, decks]);

  if (isLoading) {
    return <CircularProgress />;
  }
  if (!sortedDecks) return null;

  const isList = !mode || mode === 'list';
  const isSelect = mode === 'select';
  return (
    <div className="flex flex-wrap gap-2 lg:gap-5 justify-between">
      {sortedDecks.map((deck) => (
        <div
          key={deck.id}
          className={`rounded-large job-bg-${deck.job} bg-no-repeat bg-cover ${isList ? 'bg-[-2rem_-0.5rem] lg:bg-[-5rem_-1.5rem]' : 'bg-[center_-2rem] lg:bg-[center_-2.5rem]'} ${isSelect && !deck.isComplete ? 'opacity-disabled' : ''}`}
        >
          <Card
            isPressable={isSelect}
            isDisabled={isSelect && !deck.isComplete}
            shadow="md"
            className={`w-48 md:w-60 min-h-unit-18 lg:min-h-unit-18 bg-white/70 bg-blend-lighten dark:bg-black/70 dark:bg-blend-darken ${isSelect ? 'hover:bg-white/40 dark:hover:bg-black/40' : ''}`}
            onPress={onDeckSelected && deck.isComplete ? () => onDeckSelected(deck.id) : undefined}
          >
            <CardBody>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className={`text-foreground lg:text-xl font-bold w-40 lg:w-56 overflow-hidden whitespace-nowrap text-ellipsis ${isSelect ? 'text-center' : ''}`}
                >
                  {isList ? (
                    <RouterLink to={`/deck/${deck.id}`} className="hover:underline">
                      {deck.name}
                    </RouterLink>
                  ) : (
                    <span className={!deck.isComplete ? 'line-through' : ''}>{deck.name}</span>
                  )}
                </div>

                {isSelect && !deck.isComplete && <div className="text-danger text-sm">使用できません</div>}
              </div>
            </CardBody>
            {isList ? (
              <CardFooter className="px-2 pb-2 pt-0 gap-2">
                {!deck.isComplete && <div className="text-danger text-sm">使用できません</div>}

                <div className="ml-auto flex items-center gap-1">
                  <Tooltip content="デッキを一覧表示">
                    <Button isIconOnly size="sm" color="default" variant="ghost" onPress={() => setViewDeckId(deck.id)}>
                      <span className="icon-[zondicons--view-tile]" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="デッキを編集">
                    <Button isIconOnly size="sm" color="primary" variant="ghost" as={RouterLink} to={`/deck/${deck.id}`}>
                      <span className="icon-[mdi--edit] text-2xl" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="デッキを削除">
                    <Button isIconOnly size="sm" color="danger" variant="ghost" onPress={() => handleRemoveDeck(deck)}>
                      <span className="icon-[mdi--trash] text-2xl" />
                    </Button>
                  </Tooltip>
                </div>
              </CardFooter>
            ) : null}
          </Card>
        </div>
      ))}

      {/* justify 調節用 */}
      <div className="w-48 md:w-60 h-0"></div>
      <div className="w-48 md:w-60 h-0"></div>

      {viewDeckId ? <DeckViewModal deckId={viewDeckId} isOpen onClose={() => setViewDeckId(null)} /> : null}
    </div>
  );
}
