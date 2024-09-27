// src/handlers/callbacks/getWalletKey.ts

import { sendMessage } from "../../utils/telegramApi";
import { dbClient } from "@/src/services/db";
import { createMainMenuKeyboard } from "@/src/utils/keyboards";

export async function handleGetWalletKey(chatId: string, telegramId: string) {
  const existingUser = await dbClient.user.findUnique({
    where: { telegramId },
  });

  if (!existingUser) {
    await sendMessage(
      chatId,
      "User not found. Please send /start to register."
    );
    return;
  }

  await sendMessage(
    chatId,
    `${existingUser.publicKey}`,
    createMainMenuKeyboard()
  );
}
