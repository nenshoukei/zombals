import { z } from 'zod';
import { apiInputHandler } from '@/server/api/handler';
import { updateUser } from '@/server/db';
import { writeSessionToRequest } from '@/server/session';
import { LoginId } from '@/server/types';
import { UserId, UserName, zUserName } from '@/types';

const zUpdateParams = z.object({
  name: zUserName,
});

export const userUpdate = apiInputHandler(zUpdateParams, async (params, req, res) => {
  const user = await updateUser(req.session!.userId, params);

  const session = {
    userId: user.id as UserId,
    name: user.name as UserName,
    loginId: (user.loginId || undefined) as LoginId | undefined,
  };
  writeSessionToRequest(res, session);
  req.logger?.debug({ session }, 'User update');
  res.status(200).json({ session });
});
