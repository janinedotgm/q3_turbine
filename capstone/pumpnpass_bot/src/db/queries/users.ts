import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export const findUserByTelegramId = async (telegramId: string) => {
  const user = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1).then((users) => users[0] || null);
  return user;
};
