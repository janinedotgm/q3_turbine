import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq, inArray } from "drizzle-orm";

export const findUserByTelegramId = async (telegramId: string) => {
  const user = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1).then((users) => users[0] || null);
  return user;
};

export const findUserById = async (id: string) => {
  const user = await db.select().from(users).where(eq(users.id, id)).limit(1).then((users) => users[0] || null);
  return user;
};

export const findUsersByIds = async (ids: string[]) => {
  const result = await db.select().from(users).where(inArray(users.id, ids));
  return result;
};
