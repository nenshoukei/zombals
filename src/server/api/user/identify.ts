import { z } from 'zod';
import { apiInputHandler } from '@/server/api/handler';
import { identifyUser, userHasCompleteDeck } from '@/server/db';
import { writeSessionToRequest } from '@/server/session';
import { LoginId, UserId, UserName, zLoginId, zRawPassword } from '@/types/common';

const zIdentifyParams = z.object({
  loginId: zLoginId,
  password: zRawPassword,
});

export const userIdentify = apiInputHandler(zIdentifyParams, async ({ loginId, password }, req, res) => {
  const user = await identifyUser(req.session!.userId, loginId, password);
  if (user === 'LOGIN_ID_DUPLICATE') {
    res.status(400).json({ error: 'Login ID already exists' });
    return;
  }

  const session = {
    userId: user.id as UserId,
    name: user.name as UserName,
    loginId: user.loginId as LoginId,
    hasDeck: await userHasCompleteDeck(user.id),
  };
  writeSessionToRequest(res, session);
  req.logger?.debug({ session }, 'Identified user');
  res.status(200).json({ session });
});
