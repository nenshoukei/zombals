import { z } from 'zod';
import { zLoginId, zUserId, zUserName } from './common';

export const zSession = z.object({
  userId: zUserId,
  name: zUserName,
  loginId: zLoginId.optional(),
  hasDeck: z.boolean(),
});
export type Session = z.infer<typeof zSession>;
