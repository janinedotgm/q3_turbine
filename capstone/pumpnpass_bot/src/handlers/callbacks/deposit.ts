import { sendMessage } from "../../utils/telegramApi";
import { db } from "@/src/db";
import { getBalance } from "@/src/services/wallet";
import { createMainMenuKeyboard } from "@/src/utils/keyboards";
import { findUserByTelegramId } from "@/src/db/queries/users";
import { depositGameBet } from "@/src/solana/deposit";

export async function handleDeposit(chatId: string, telegramId: string, depositAmount: number) {

  const result = await depositGameBet(telegramId, depositAmount);
  console.log("🚀 ~ handleDeposit ~ result:", result);

  if(result.status === 200) {

    await sendMessage(
      chatId,
      `Deposit successful!`
    );
  } else {
    await sendMessage(
      chatId,
      `Deposit failed!`
    );
  }
}

export async function handleCancelDeposit(chatId: string, telegramId: string) {
  await sendMessage(
    chatId,
    "Deposit cancelled.",
    createMainMenuKeyboard()
  );
}

