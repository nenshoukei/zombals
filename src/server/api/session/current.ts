import { apiHandler } from '@/server/api/handler';
import { readSessionFromRequest } from '@/server/session';

export const sessionCurrent = apiHandler((req, res) => {
  const session = readSessionFromRequest(req);

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ session });
});
