import { Deck, PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { uuidv7 } from 'uuidv7';
import { DECK_CARD_NUM } from '@/config/common';
import {
  DeckId,
  GamePlayer,
  GameRecord,
  GameRecordId,
  Id,
  Job,
  LeaderPosition,
  LoginId,
  PlayerRank,
  RawPassword,
  UserId,
  zGamePlayer,
  zGameRecord,
} from '@/types';

export const prisma = new PrismaClient();

/**
 * ユーザーを作成する。
 *
 * @param name ユーザーが入力した表示名
 * @returns 作成されたユーザー
 */
export async function createUser(name: string): Promise<User> {
  const user = await prisma.user.create({
    data: {
      id: uuidv7(),
      name,
      rank: PlayerRank.BLONZE,
    },
  });
  return user;
}

/**
 * ログインIDのユーザーが存在するかどうか確認する。
 */
export async function loginIdExists(loginId: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      loginId,
    },
  });
  return !!user;
}

export interface UpdateUserParams {
  name: string;
}

/**
 * ユーザー情報を更新する。
 */
export async function updateUser(userId: UserId, params: UpdateUserParams): Promise<User> {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: params.name,
    },
  });
  return user;
}

/**
 * ログインIDが利用可能かどうか確認する。
 */
export async function isLoginIdAvailable(loginId: LoginId): Promise<boolean> {
  const count = await prisma.user.count({
    where: {
      loginId,
    },
    take: 1,
  });
  return count === 0;
}

/**
 * ユーザーのログインIDとパスワードを設定する。
 */
export async function identifyUser(userId: UserId, loginId: LoginId, rawPassword: RawPassword): Promise<User | 'LOGIN_ID_DUPLICATE'> {
  const exists = await loginIdExists(loginId);
  if (exists) {
    return 'LOGIN_ID_DUPLICATE';
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      loginId,
      password: await bcrypt.hash(rawPassword, 10),
    },
  });

  return user;
}

/**
 * ログインを試みる。
 */
export async function login(loginId: LoginId, rawPassword: RawPassword): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: {
      loginId,
    },
  });
  if (!user) return null;

  const match = await bcrypt.compare(rawPassword, user.password!);
  if (!match) return null;

  return user;
}

/**
 * デッキを取得する。
 */
export async function getDeckById(deckId: DeckId): Promise<Deck | null> {
  const deck = await prisma.deck.findUnique({
    where: {
      id: deckId,
    },
  });
  return deck;
}

/**
 * ユーザーが有効なデッキを持っているかどうか確認する。
 */
export async function userHasCompleteDeck(userId: UserId): Promise<boolean> {
  const count = await prisma.deck.count({
    where: {
      userId,
      isComplete: true,
    },
    take: 1,
  });
  return count > 0;
}

export type ListedDeck = Pick<Deck, 'id' | 'userId' | 'name' | 'job' | 'isComplete' | 'createdAt' | 'updatedAt'>;

/**
 * ユーザーのデッキを全て取得する。
 */
export async function getAllDecksByUserId(userId: UserId): Promise<ListedDeck[]> {
  const decks = await prisma.deck.findMany({
    select: {
      id: true,
      userId: true,
      name: true,
      job: true,
      isComplete: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return decks;
}

export interface CreateDeckParams {
  userId: UserId;
  name: string;
  cardDefIds: Id[];
  job: Job;
}

/**
 * デッキを作成する。
 */
export async function createDeck(params: CreateDeckParams): Promise<Deck> {
  const deck = await prisma.deck.create({
    data: {
      id: uuidv7(),
      userId: params.userId,
      name: params.name,
      job: params.job,
      cardDefIds: params.cardDefIds,
      isComplete: params.cardDefIds.length === DECK_CARD_NUM,
    },
  });
  return deck;
}

/**
 * デッキの所有者かどうか確認する。
 */
export async function isOwnerOfDeck(userId: UserId, deckId: DeckId): Promise<boolean> {
  const deck = await prisma.deck.findUnique({
    where: {
      id: deckId,
    },
    select: {
      userId: true,
    },
  });
  return deck?.userId === userId;
}

export interface UpdateDeckParams {
  name: string;
  cardDefIds: Id[];
}

/**
 * デッキを更新する。
 */
export async function updateDeck(deckId: DeckId, params: UpdateDeckParams): Promise<Deck> {
  const deck = await prisma.deck.update({
    where: {
      id: deckId,
    },
    data: {
      name: params.name,
      cardDefIds: params.cardDefIds,
      isComplete: params.cardDefIds.length === DECK_CARD_NUM,
    },
  });
  return deck;
}

/**
 * デッキを削除する。
 */
export async function deleteDeck(deckId: DeckId): Promise<void> {
  await prisma.deck.delete({
    where: {
      id: deckId,
    },
  });
}

/**
 * DBからデータを取得してゲーム参加者 (GamePlayer) を作成する。
 *
 * 参加時点でのユーザー名やランク、使用デッキなどが記録される。
 * まだ DB にレコードが作成されるわけではないので注意。（ゲーム開始時に作成される）
 *
 * @param userId ユーザーID
 * @param deckId デッキID
 * @returns 作成された GamePlayer
 */
export async function getGamePlayer(userId: UserId, deckId: DeckId): Promise<GamePlayer> {
  const [dbUser, dbDeck] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      select: {
        name: true,
        titleId: true,
        rank: true,
      },
      where: {
        id: userId,
      },
    }),
    prisma.deck.findUniqueOrThrow({
      select: {
        job: true,
        cardDefIds: true,
      },
      where: {
        id: deckId,
        userId,
        isComplete: true,
      },
    }),
  ]);

  const user = zGamePlayer.pick({ name: true, titleId: true, rank: true }).parse(dbUser);
  const deck = zGamePlayer.pick({ job: true, cardDefIds: true }).parse(dbDeck);

  return {
    userId,
    name: user.name,
    titleId: user.titleId,
    rank: user.rank,
    job: deck.job,
    cardDefIds: deck.cardDefIds,
  };
}

/**
 * 指定IDのゲーム記録 (GameRecord) を取得する。
 *
 * @param gameRecordId ゲーム記録ID
 * @returns GameRecord または null
 */
export async function getGameRecord(gameRecordId: GameRecordId): Promise<GameRecord | null> {
  const dbRecord = await prisma.gameRecord.findUnique({
    where: {
      id: gameRecordId,
    },
    include: {
      gamePlayers: {
        orderBy: {
          position: 'asc',
        },
      },
    },
  });
  if (!dbRecord) return null;

  const playerA = zGamePlayer.parse(dbRecord.gamePlayers[0]);
  const playerB = zGamePlayer.parse(dbRecord.gamePlayers[1]);

  return {
    id: dbRecord.id as GameRecordId,
    startedAt: dbRecord.startedAt.getTime(),
    finishedAt: dbRecord.finishedAt ? dbRecord.finishedAt.getTime() : null,
    players: {
      AL: playerA,
      BL: playerB,
    },
    first: dbRecord.first as LeaderPosition,
    winner: dbRecord.winner as LeaderPosition | null,
    seed: dbRecord.seed,
    actions: zGameRecord.shape.actions.parse(dbRecord.actions),
  };
}

/**
 * ゲーム記録 (GameRecord) を保存する。
 *
 * @param gameRecord ゲーム記録
 */
export async function saveGameRecord(gameRecord: GameRecord): Promise<void> {
  if (await prisma.gameRecord.findUnique({ where: { id: gameRecord.id } })) {
    // すでに記録済み
    return;
  }
  if (!gameRecord.finishedAt) {
    // まだ終了していないゲーム
    throw new Error(`saveGameRecord: Not finished game passed ${gameRecord.id}`);
  }

  await prisma.gameRecord.create({
    select: {
      id: true,
    },
    data: {
      id: gameRecord.id,
      seed: gameRecord.seed,
      first: gameRecord.first,
      winner: gameRecord.winner,
      startedAt: new Date(gameRecord.startedAt),
      finishedAt: gameRecord.finishedAt ? new Date(gameRecord.finishedAt) : null,
      gamePlayers: {
        create: [
          { id: uuidv7(), position: 'AL', ...gameRecord.players.AL },
          { id: uuidv7(), position: 'BL', ...gameRecord.players.BL },
        ],
      },
      actions: { toJSON: () => gameRecord.actions },
    },
  });
}
