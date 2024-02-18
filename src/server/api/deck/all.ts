import { apiHandler } from '@/server/api/handler';
import { getAllDecksByUserId } from '@/server/db';

export const deckAll = apiHandler(async (req, res) => {
  const decks = await getAllDecksByUserId(req.session!.userId);
  res.setHeader('Cache-Control', 'max-age=1');
  res.status(200).json({ decks });
});
