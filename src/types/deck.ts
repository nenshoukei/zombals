import { z } from 'zod';
import { zId, zJob, zUserId } from './common';

/** デッキID */
export const zDeckId = z
  .string()
  .uuid()
  .refine((v): v is DeckId => true);
export type DeckId = string;

/** デッキ名 */
export const zDeckName = z.string().min(1);

export const zDeck = z.object({
  id: zDeckId,
  userId: zUserId,
  name: zDeckName,
  job: zJob,
  cardDefIds: z.array(zId), // 枚数チェックはしない
  isComplete: z.boolean(),
  createdAt: z.string(), // JSON では ISO 文字列
  updatedAt: z.string(), // 同上
});
export type Deck = z.infer<typeof zDeck>;

export const zListedDeck = zDeck.pick({
  id: true,
  userId: true,
  name: true,
  job: true,
  isComplete: true,
  createdAt: true,
  updatedAt: true,
});
export type ListedDeck = z.infer<typeof zListedDeck>;
