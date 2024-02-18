import { apiHandler } from '@/server/api/handler';
import { deleteSessionInResponse } from '@/server/session';

export const sessionLogout = apiHandler((req, res) => {
  deleteSessionInResponse(res);
  req.logger?.debug('Logged out');
  res.status(200).json({ message: 'Logged out' });
});
