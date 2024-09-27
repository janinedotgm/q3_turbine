
import { sendMessage } from "../../utils/telegramApi";
import { dbClient } from "@/src/services/db";
import { getBalance } from "@/src/services/wallet";
import { createMainMenuKeyboard } from "@/src/utils/keyboards";

export async function handleStartNewGame(chatId: string, telegramId: string) {
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
  
  if (balance < 0.06) {
    await sendMessage(
      chatId,
      "You need 0.06 SOL to start a new game. Please top up your wallet first.",
      createMainMenuKeyboard()
    );
    return;
  }
  
  
  
}