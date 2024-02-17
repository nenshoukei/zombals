import { Request, Response } from 'express';
import { getAllDecksByUserId } from '@/server/db';

export function deckAll(req: Request, res: Response) {
  (async () => {
    const decks = await getAllDecksByUserId(req.session!.userId);
    res.status(200).json({ decks });
  })().catch((e) => {
    console.error(e);
    res.status(500).json({ error: 'Failed to get decks' });
  });
}
