import useSWR, { KeyedMutator } from 'swr';
import { z } from 'zod';
import { ListedDeck, zListedDeck } from '@/types';

const zDecksResponse = z.object({
  decks: z.array(zListedDeck),
});
type DecksResponse = z.infer<typeof zDecksResponse>;

export interface UseDeckList {
  isLoading: boolean;
  decks: ListedDeck[] | undefined;
  mutate: KeyedMutator<DecksResponse>;
}

export function useDeckList(): UseDeckList {
  const { data, isLoading, mutate } = useSWR<DecksResponse>('/api/deck/all');

  return {
    isLoading,
    decks: data ? data.decks : undefined,
    mutate,
  };
}
