import { z } from 'zod';
import { apiInputHandler } from '@/server/api/handler';
import { deleteDeck, isOwnerOfDeck } from '@/server/db';
import { zDeckId } from '@/types';

const zDeckDeleteParams = z.object({
  deckId: zDeckId,
});

export const deckDelete = apiInputHandler(zDeckDeleteParams, async ({ deckId }, req, res) => {
  if (!(await isOwnerOfDeck(req.session!.userId, deckId))) {
    req.logger?.debug({ deckId }, 'Attempt to delete others deck');
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  await deleteDeck(deckId);
  req.logger?.debug({ deckId }, 'Deleted deck');
  res.status(204).end();
});
