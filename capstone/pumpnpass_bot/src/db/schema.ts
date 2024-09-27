import { integer, pgTable, boolean, PgArray, text, timestamp } from 'drizzle-orm/pg-core';
import { uuid } from 'drizzle-orm/pg-core';
import { gameStatusEnum, roundStatusEnum } from './enums';

/**
 * Users
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  telegramId: text('telegramId').notNull(),
  publicKey: text('publicKey').notNull(),
  username: text('username').notNull(),
  authTag: text('authTag').notNull(),
  iv: text('iv').notNull(),
  secretKey: text('secretKey').notNull(),
  chatId: text('chatId').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

/**
 * The overall game state - this part will be saved on the blockchain, too.
 * 
 * @id is the id of the game.
 * @gameStatus is the status of the game.
 * @createdAt is the timestamp of the game creation.
 * @updatedAt is the timestamp of the game update.
 * @rounds is the number of rounds in the game.
 * @currentRound is the current active round of the game.
 */
export const game = pgTable('game', {
  id: uuid('id').primaryKey().defaultRandom(),
  gamestatus: gameStatusEnum('gamestatus').notNull().default('Open'),
  rounds: integer('rounds').notNull().default(2),
  currentRound: integer('currentRound').notNull().default(0),
  players: uuid('players').references(() => users.id).array(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

/**
 * The rounds of the game.
 * 
 * @id is the id of the round.
 * @gameId is the id of the game.
 * @maxPumps is the random pump threshold for the round.
 * @currentPumps is the current value of the round.
 * @roundStatus is the status of the round.
 * @looserId is the id of the user who lost the round.
 * @number is the number of the round in the game.
 * @activePlayerId is the id of the user who is currently active in the round.
 * @createdAt is the timestamp of the round creation.
 * @updatedAt is the timestamp of the round update.
 */
export const round = pgTable('round', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('gameId').references(() => game.id).notNull(),
  maxPumps: integer('maxPumps').notNull(),
  currentPumps: integer('currentPumps').notNull().default(0),
  roundstatus: roundStatusEnum('roundstatus').notNull().default('Active'),
  looserId: uuid('looserId').references(() => users.id),
  number: integer('number').notNull(),
  activePlayerId: uuid('activePlayerId').references(() => users.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

/**
 * The player game state.
 * 
 * @id is the id of the player game.
 * @userId is the id of the user.
 * @gameId is the id of the game.
 * @totalPoints is the total points of the user in the game.
 * @chatId is the chat id of the user.
 * @createdAt is the timestamp of the player game creation.
 * @updatedAt is the timestamp of the player game update.
 */
export const playerGame = pgTable('playerGame', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').references(() => users.id).notNull(),
  gameId: uuid('gameId').references(() => game.id).notNull(),
  totalPoints: integer('totalPoints').notNull().default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

/**
 * The player round state.
 * 
 * @id is the id of the player round.
 * @userId is the id of the user.
 * @gameId is the id of the game.
 * @roundId is the id of the round.
 * @roundPoints is the points of the user in the round.
 * @pumps is the number of pumps the user has done in the round.
 * @turns is the number of turns the user has done in the round.
 * @createdAt is the timestamp of the player round creation.
 * @updatedAt is the timestamp of the player round update.
 */
export const playerRound = pgTable('playerRound', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').references(() => users.id).notNull(),
  gameId: uuid('gameId').references(() => game.id).notNull(),
  roundId: uuid('roundId').references(() => round.id).notNull(),
  roundPoints: integer('roundPoints').notNull().default(0),
  pumps: integer('pumps').notNull().default(0),
  turns: integer('turns').notNull().default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertGame = typeof game.$inferInsert;
export type SelectGame = typeof game.$inferSelect;

export type InsertRound = typeof round.$inferInsert;
export type SelectRound = typeof round.$inferSelect;

export type InsertPlayerGame = typeof playerGame.$inferInsert;
export type SelectPlayerGame = typeof playerGame.$inferSelect;

export type InsertPlayerRound = typeof playerRound.$inferInsert;
export type SelectPlayerRound = typeof playerRound.$inferSelect;
