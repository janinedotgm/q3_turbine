// src/handlers/callbacks/checkBalance.ts

import { sendMessage } from "../../utils/telegramApi";
import { dbClient } from "@/src/services/db";
import { getBalance } from "@/src/services/wallet";
import { createMainMenuKeyboard } from "@/src/utils/keyboards";

export async function handleCheckBalance(chatId: string, telegramId: string) {
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

  const balance = await getBalance(existingUser.publicKey);
  await sendMessage(
    chatId,
    `Your existing balance is ${balance} SOL.`,
    createMainMenuKeyboard()
  );
}
