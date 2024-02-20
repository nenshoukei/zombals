import { Button, Card, CardBody, CardFooter, Select, SelectItem, SelectProps } from '@nextui-org/react';
import ky from 'ky';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDeckList } from '#/hooks/useDeckList';
import { ListedDeck } from '@/types';

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
  sort?: DeckListSort;
};

export default function DeckList({ sort }: DeckListProps) {
  const { decks, mutate: mutateDecks } = useDeckList();

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

  if (!sortedDecks) return null;
  return (
    <div className="flex flex-wrap gap-5 justify-between after:w-64 after:h-0 after:block">
      {sortedDecks.map((deck) => (
        <div key={deck.id} className={`job-bg-${deck.job} bg-no-repeat bg-cover bg-[-5rem_-0.5rem] rounded-large`}>
          <Card shadow="md" className="w-64 bg-white/70 bg-blend-lighten dark:bg-black/70 dark:bg-blend-darken">
            <CardBody>
              <Link
                to={`/deck/${deck.id}`}
                className="text-foreground text-xl font-bold w-56 overflow-hidden whitespace-nowrap text-ellipsis"
              >
                {deck.name}
              </Link>
            </CardBody>
            <CardFooter className="px-2 pb-2 pt-0 justify-end gap-2">
              <Button
                color="primary"
                variant="solid"
                startContent={<span className="icon-[mdi--edit] text-2xl" />}
                as={Link}
                to={`/deck/${deck.id}`}
              >
                編集
              </Button>
              <Button isIconOnly color="danger" variant="ghost" onPress={() => handleRemoveDeck(deck)}>
                <span className="icon-[mdi--trash] text-2xl" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
}
