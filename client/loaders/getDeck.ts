import ky from 'ky';
import { z } from 'zod';
import { Deck, DeckId, zDeck } from '@/types';

const zResponse = z.object({
  deck: zDeck,
});

export async function getDeck(deckId: DeckId): Promise<Deck | null> {
  const res = await ky.get(`/api/deck/get`, { searchParams: { deckId } }).json();
  const parsed = zResponse.parse(res);
  return parsed.deck;
}
