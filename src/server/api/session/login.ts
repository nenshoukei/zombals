import { Request, Response } from 'express';
import { z } from 'zod';
import { login } from '@/server/db';
import { writeSessionToRequest } from '@/server/session';
import { LoginId, zLoginId, zRawPassword } from '@/server/types';
import { UserId, UserName } from '@/types';

const zLoginParams = z.object({
  loginId: zLoginId,
  password: zRawPassword,
});

export function sessionLogin(req: Request, res: Response) {
  const parsed = zLoginParams.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { loginId, password } = parsed.data;
  login(loginId, password)
    .then((user) => {
      if (!user) {
        res.status(400).json({ error: 'Invalid login ID or password' });
        return;
      }

      const session = {
        userId: user.id as UserId,
        name: user.name as UserName,
        loginId: user.loginId as LoginId,
      };
      writeSessionToRequest(res, session);
      res.status(200).json({ session });
    })
    .catch((e) => {
      console.error(e);
      res.status(500).json({ error: 'Failed to login' });
    });
}
