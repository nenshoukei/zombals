import { Request, Response } from 'express';
import { z } from 'zod';
import { DECK_CARD_NUM } from '@/config/common';
import { validateDeck } from '@/game';
import { getDeckById, updateDeck } from '@/server/db';
import { zDeckId, zId } from '@/types';

const zDeckUpdateParams = z.object({
  deckId: zDeckId,
  name: z.string().min(1),
  cardDefIds: z.array(zId).max(DECK_CARD_NUM), // 不完全でも保存できる
});

export function deckUpdate(req: Request, res: Response) {
  const parsed = zDeckUpdateParams.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  (async () => {
    const { deckId, name, cardDefIds } = parsed.data;

    const existDeck = await getDeckById(deckId);
    if (!existDeck || existDeck.userId !== req.session!.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const result = validateDeck(cardDefIds, existDeck.job);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    const deck = await updateDeck(deckId, { name, cardDefIds });
    res.status(200).json({ deck });
  })().catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Failed to create deck' });
  });
}
