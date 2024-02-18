import { Router } from 'express';
import { deckAll } from '@/server/api/deck/all';
import { deckCreate } from '@/server/api/deck/create';
import { deckDelete } from '@/server/api/deck/delete';
import { deckGet } from '@/server/api/deck/get';
import { deckUpdate } from '@/server/api/deck/update';
import { sessionCurrent } from '@/server/api/session/current';
import { sessionLogin } from '@/server/api/session/login';
import { sessionLogout } from '@/server/api/session/logout';
import { userIdCheck } from '@/server/api/user/idcheck';
import { userIdentify } from '@/server/api/user/identify';
import { userRegister } from '@/server/api/user/register';
import { userUpdate } from '@/server/api/user/update';
import { authMiddleware } from '@/server/middleware';

export const routes = Router();

routes.get('/api/session/current', sessionCurrent);
routes.post('/api/session/login', sessionLogin);
routes.post('/api/session/logout', sessionLogout);

routes.post('/api/user/register', userRegister);
routes.post('/api/user/update', authMiddleware, userUpdate);
routes.post('/api/user/identify', authMiddleware, userIdentify);
routes.post('/api/user/idcheck', authMiddleware, userIdCheck);

routes.get('/api/deck/get', authMiddleware, deckGet);
routes.get('/api/deck/all', authMiddleware, deckAll);
routes.post('/api/deck/create', authMiddleware, deckCreate);
routes.post('/api/deck/update', authMiddleware, deckUpdate);
routes.post('/api/deck/delete', authMiddleware, deckDelete);

routes.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not found' });
  } else {
    next();
  }
});
