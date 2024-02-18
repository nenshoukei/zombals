import { z } from 'zod';
import { apiInputHandler } from '@/server/api/handler';
import { isLoginIdAvailable } from '@/server/db';
import { zLoginId } from '@/types/common';

const zIdCheckParams = z.object({
  loginId: zLoginId,
});

export const userIdCheck = apiInputHandler(zIdCheckParams, async ({ loginId }, req, res) => {
  const isAvailable = await isLoginIdAvailable(loginId);
  res.status(200).json({ isAvailable });
});
