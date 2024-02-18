import { useEffect, useState } from 'react';
import type { ListedDeck } from '@/server/db';

export function useDeckList(): [ListedDeck[] | null, () => void] {
  const [decks, setDecks] = useState<ListedDeck[] | null>(null);

  const reload = () => {
    fetch('/api/deck/all', { method: 'GET', credentials: 'same-origin' })
      .then((res) => res.json())
      .then((data) => {
        setDecks(data.decks);
      });
  };

  useEffect(() => {
    reload();
  }, []);

  return [decks, reload];
}
