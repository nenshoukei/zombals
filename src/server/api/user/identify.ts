import { Request, Response } from 'express';
import { z } from 'zod';
import { identifyUser } from '@/server/db';
import { writeSessionToRequest } from '@/server/session';
import { LoginId, zLoginId, zRawPassword } from '@/server/types';
import { UserId, UserName } from '@/types';

const zIdentifyParams = z.object({
  loginId: zLoginId,
  password: zRawPassword,
});

export function userIdentify(req: Request, res: Response) {
  const parsed = zIdentifyParams.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  (async () => {
    const { loginId, password } = parsed.data;

    const user = await identifyUser(req.session!.userId, loginId, password);
    if (user === 'LOGIN_ID_DUPLICATE') {
      res.status(400).json({ error: 'Login ID already exists' });
      return;
    }

    const session = {
      userId: user.id as UserId,
      name: user.name as UserName,
      loginId: user.loginId as LoginId,
    };
    writeSessionToRequest(res, session);
    res.status(200).json({ session });
  })().catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Failed to update user' });
  });
}
