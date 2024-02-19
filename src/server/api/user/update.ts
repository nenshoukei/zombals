import { z } from 'zod';
import { apiInputHandler } from '@/server/api/handler';
import { updateUser, userHasCompleteDeck } from '@/server/db';
import { writeSessionToRequest } from '@/server/session';
import { Session } from '@/types';
import { LoginId, UserId, UserName, zUserName } from '@/types/common';

const zUpdateParams = z.object({
  name: zUserName,
});

export const userUpdate = apiInputHandler(zUpdateParams, async (params, req, res) => {
  const user = await updateUser(req.session!.userId, params);

  const session: Session = {
    userId: user.id as UserId,
    name: user.name as UserName,
    loginId: (user.loginId || undefined) as LoginId | undefined,
    hasDeck: await userHasCompleteDeck(user.id),
  };
  writeSessionToRequest(res, session);
  req.logger?.debug({ session }, 'User update');
  res.status(200).json({ session });
});
