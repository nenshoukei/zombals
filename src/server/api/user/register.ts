import { z } from 'zod';
import { apiInputHandler } from '@/server/api/handler';
import { createUser } from '@/server/db';
import { readSessionFromRequest, writeSessionToRequest } from '@/server/session';
import { UserId, UserName, zUserName } from '@/types/common';

const zRegisterParams = z.object({
  name: zUserName,
});

export const userRegister = apiInputHandler(zRegisterParams, async ({ name }, req, res) => {
  const currentSession = readSessionFromRequest(req);
  if (currentSession) {
    res.status(400).json({ error: 'Already registered' });
    return;
  }

  const user = await createUser(name);

  const session = {
    userId: user.id as UserId,
    name: user.name as UserName,
    hasDeck: false,
  };
  writeSessionToRequest(res, session);
  req.logger?.debug({ session }, 'User registered');
  res.status(201).json({ session });
});
