import { z } from 'zod';
import { sortCardDefinitionIds } from '@/definition/sort';
import { validateDeck } from '@/game/validate_deck';
import { apiInputHandler } from '@/server/api/handler';
import { createDeck } from '@/server/db';
import { zId, zJob } from '@/types';

const zDeckCreateParams = z.object({
  name: z.string().min(1),
  job: zJob,
  cardDefIds: z.array(zId), // 不完全でも保存できる
});

export const deckCreate = apiInputHandler(zDeckCreateParams, async ({ name, job, cardDefIds }, req, res) => {
  const result = validateDeck(cardDefIds, job);
  if (!result.success) {
    req.logger?.debug(`Deck validation error: ${result.message.ja}`);
    res.status(400).json({ error: result.message });
    return;
  }

  const sortedCardDefIds = sortCardDefinitionIds(cardDefIds);

  const deck = await createDeck({
    userId: req.session!.userId,
    name,
    job,
    cardDefIds: sortedCardDefIds,
  });
  req.logger?.debug({ deck }, 'Created deck');
  res.status(201).json({ deck });
});
