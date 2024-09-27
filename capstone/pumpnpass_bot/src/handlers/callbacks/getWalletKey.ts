// src/handlers/callbacks/getWalletKey.ts

import { sendMessage } from "../../utils/telegramApi";
import { createMainMenuKeyboard } from "../../utils/keyboards";
import { findUserByTelegramId } from "@/src/db/queries/users";

export async function handleGetWalletKey(chatId: string, telegramId: string) {
  const existingUser = await findUserByTelegramId(telegramId);

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
