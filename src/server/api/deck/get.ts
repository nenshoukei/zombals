import { Request, Response } from 'express';
import { z } from 'zod';
import { getDeckById } from '@/server/db';
import { zDeckId } from '@/types';

const zDeckGetParams = z.object({
  deckId: zDeckId,
});

export function deckGet(req: Request, res: Response) {
  const parsed = zDeckGetParams.safeParse(req.params.deckId);
  if (!parsed.success) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  (async () => {
    const { deckId } = parsed.data;

    const deck = await getDeckById(deckId);
    if (!deck || deck.userId !== req.session!.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.status(200).json({ deck });
  })().catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Failed to get deck' });
  });
}
