import { Request, Response } from 'express';
import { z } from 'zod';
import { createUser } from '@/server/db';
import { readSessionFromRequest, writeSessionToRequest } from '@/server/session';
import { UserId, UserName, zUserName } from '@/types';

const zRegisterParams = z.object({
  name: zUserName,
});

export function userRegister(req: Request, res: Response) {
  const currentSession = readSessionFromRequest(req);
  if (currentSession) {
    res.status(400).json({ error: 'Already registered' });
    return;
  }

  const parsed = zRegisterParams.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { name } = parsed.data;
  createUser(name)
    .then((user) => {
      const session = {
        userId: user.id as UserId,
        name: user.name as UserName,
      };
      writeSessionToRequest(res, session);
      res.status(201).json({ session });
    })
    .catch((e) => {
      console.error(e);
      res.status(500).json({ error: 'Failed to create user' });
    });
}
