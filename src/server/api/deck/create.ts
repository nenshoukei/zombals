import { Request, Response } from 'express';
import { z } from 'zod';
import { DECK_CARD_NUM } from '@/config/common';
import { validateDeck } from '@/game/validate_deck';
import { createDeck } from '@/server/db';
import { zId, zJob } from '@/types';

const zDeckCreateParams = z.object({
  name: z.string().min(1),
  job: zJob,
  cardDefIds: z.array(zId).max(DECK_CARD_NUM), // 不完全でも保存できる
});

export function deckCreate(req: Request, res: Response) {
  const parsed = zDeckCreateParams.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { name, job, cardDefIds } = parsed.data;

  const result = validateDeck(cardDefIds, job);
  if (!result.success) {
    res.status(400).json({ error: result.message });
    return;
  }

  createDeck({ userId: req.session!.userId, name, job, cardDefIds })
    .then((deck) => {
      res.status(201).json({ deck });
    })
    .catch((e) => {
      console.error(e);
      res.status(500).json({ error: 'Failed to create deck' });
    });
}
