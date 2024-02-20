import { z } from 'zod';
import { validateDeck } from '@/game';
import { apiInputHandler } from '@/server/api/handler';
import { getDeckById, updateDeck } from '@/server/db';
import { zDeckId, zId } from '@/types';

const zDeckUpdateParams = z.object({
  deckId: zDeckId,
  name: z.string().min(1).optional(),
  cardDefIds: z.array(zId).optional(), // 不完全でも保存できる
});

export const deckUpdate = apiInputHandler(zDeckUpdateParams, async ({ deckId, name, cardDefIds }, req, res) => {
  if (name === undefined && cardDefIds === undefined) {
    res.status(400).json({ error: 'name or cardDefIds is required' });
    return;
  }

  const existDeck = await getDeckById(deckId);
  if (!existDeck || existDeck.userId !== req.session!.userId) {
    req.logger?.debug({ deckId }, 'Attempt to update others deck');
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  if (cardDefIds) {
    const result = validateDeck(cardDefIds, existDeck.job);
    if (!result.success) {
      req.logger?.debug(`Deck validation error: ${result.message.ja}`);
      res.status(400).json({ error: result.message });
      return;
    }
  }

  const deck = await updateDeck(deckId, { name, cardDefIds });
  req.logger?.debug({ deck }, 'Updated deck');
  res.status(200).json({ deck });
});
