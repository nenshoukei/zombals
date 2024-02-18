import { apiHandler } from '@/server/api/handler';
import { getAllDecksByUserId } from '@/server/db';

export const deckAll = apiHandler(async (req, res) => {
  const decks = await getAllDecksByUserId(req.session!.userId);
  res.status(200).json({ decks });
});
