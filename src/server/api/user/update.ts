import { Request, Response } from 'express';
import { z } from 'zod';
import { updateUser } from '@/server/db';
import { writeSessionToRequest } from '@/server/session';
import { LoginId } from '@/server/types';
import { UserId, UserName, zUserName } from '@/types';

const zUpdateParams = z.object({
  name: zUserName,
});

export function userUpdate(req: Request, res: Response) {
  const parsed = zUpdateParams.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  (async () => {
    const user = await updateUser(req.session!.userId, parsed.data);

    const session = {
      userId: user.id as UserId,
      name: user.name as UserName,
      loginId: (user.loginId || undefined) as LoginId | undefined,
    };
    writeSessionToRequest(res, session);
    res.status(200).json({ session });
  })().catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Failed to update user' });
  });
}
