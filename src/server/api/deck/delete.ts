import { Request, Response } from 'express';
import { z } from 'zod';
import { deleteDeck, isOwnerOfDeck } from '@/server/db';
import { zDeckId } from '@/types';

const zDeckDeleteParams = z.object({
  deckId: zDeckId,
});

export function deckDelete(req: Request, res: Response) {
  const parsed = zDeckDeleteParams.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  (async () => {
    const { deckId } = parsed.data;

    if (!(await isOwnerOfDeck(req.session!.userId, deckId))) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const deck = await deleteDeck(deckId);
    res.status(200).json({ deck });
  })().catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Failed to create deck' });
  });
}
