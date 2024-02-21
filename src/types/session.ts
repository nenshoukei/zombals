import { z } from 'zod';
import { zLocale, zLoginId, zUserId, zUserName } from './common';

export const zSession = z.object({
  userId: zUserId,
  name: zUserName,
  loginId: zLoginId.optional(),
  locale: zLocale,
});
export type Session = z.infer<typeof zSession>;
