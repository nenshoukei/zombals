import { z } from 'zod';
import { apiGetHandler } from '@/server/api/handler';
import { getDeckById } from '@/server/db';
import { zDeckId } from '@/types';

const zDeckGetQuery = z.object({
  deckId: zDeckId,
});

export const deckGet = apiGetHandler(zDeckGetQuery, async ({ deckId }, req, res) => {
  const deck = await getDeckById(deckId);
  if (!deck || deck.userId !== req.session!.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  res.setHeader('Cache-Control', 'max-age=1');
  res.status(200).json({ deck });
});
