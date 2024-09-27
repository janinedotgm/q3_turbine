
import { sendMessage } from "../../utils/telegramApi";
import { findUserByTelegramId } from "@/src/db/queries/users";
import { getBalance } from "@/src/services/wallet";
import { createMainMenuKeyboard } from "@/src/utils/keyboards";

export async function handleStartNewGame(chatId: string, telegramId: string) {
  const existingUser = await findUserByTelegramId(telegramId);
  
  if (!existingUser) {
    await sendMessage(
      chatId,
      "User not found. Please send /start to register."
    );
    return;
  }

  const balance = await getBalance(existingUser.publicKey);
  
  if (balance < 0.01) {
    await sendMessage(
      chatId,
      "You need 0.01 SOL to start a new game. Please top up your wallet first.",
      createMainMenuKeyboard()
    );
    return;
  }
  
  
  
}