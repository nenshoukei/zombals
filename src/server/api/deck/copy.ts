import { z } from 'zod';
import { apiInputHandler } from '@/server/api/handler';
import { createDeck, getDeckById } from '@/server/db';
import { Id, zDeckId } from '@/types';

const zDeckCopyParams = z.object({
  deckId: zDeckId,
});

export const deckCopy = apiInputHandler(zDeckCopyParams, async ({ deckId }, req, res) => {
  const deck = await getDeckById(deckId);
  if (!deck) {
    res.status(404).json({ error: 'Deck not found' });
    return;
  }

  const copiedDeck = await createDeck({
    userId: req.session!.userId,
    name: deck.name,
    job: deck.job,
    cardDefIds: deck.cardDefIds as Id[],
  });
  req.logger?.debug({ deckId, copiedDeck }, 'Copied deck');
  res.status(201).json({ deck });
});
