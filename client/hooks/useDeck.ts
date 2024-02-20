import useSWR, { KeyedMutator } from 'swr';
import { z } from 'zod';
import { Deck, zDeck } from '@/types';

const zDeckResponse = z.object({
  deck: zDeck,
});
type DeckResponse = z.infer<typeof zDeckResponse>;

export interface UseDeck {
  isLoading: boolean;
  deck: Deck | null | undefined;
  mutate: KeyedMutator<DeckResponse>;
}

export function useDeck(deckId: string | undefined): UseDeck {
  const { data, isLoading, mutate } = useSWR<DeckResponse>(deckId ? '/api/deck/get?deckId=' + deckId : null);

  return {
    isLoading,
    deck: data ? data.deck : undefined,
    mutate,
  };
}
