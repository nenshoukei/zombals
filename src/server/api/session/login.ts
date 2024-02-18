import { z } from 'zod';
import { apiInputHandler } from '@/server/api/handler';
import { login } from '@/server/db';
import { writeSessionToRequest } from '@/server/session';
import { LoginId, zLoginId, zRawPassword } from '@/server/types';
import { UserId, UserName } from '@/types';

const zLoginParams = z.object({
  loginId: zLoginId,
  password: zRawPassword,
});

export const sessionLogin = apiInputHandler(zLoginParams, async ({ loginId, password }, req, res) => {
  const user = await login(loginId, password);
  if (!user) {
    req.logger?.debug({ loginId }, 'Invalid login ID or password');
    res.status(400).json({ error: 'Invalid login ID or password' });
    return;
  }

  const session = {
    userId: user.id as UserId,
    name: user.name as UserName,
    loginId: user.loginId as LoginId,
  };
  writeSessionToRequest(res, session);
  req.logger?.debug({ session }, 'Logged in');
  res.status(200).json({ session });
});
