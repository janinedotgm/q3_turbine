import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { uuid } from 'drizzle-orm/pg-core';


export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  telegramId: text('telegramId').notNull(),
  publicKey: text('publicKey').notNull(),
  username: text('username').notNull(),
  authTag: text('authTag').notNull(),
  iv: text('iv').notNull(),
  secretKey: text('secretKey').notNull(),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
