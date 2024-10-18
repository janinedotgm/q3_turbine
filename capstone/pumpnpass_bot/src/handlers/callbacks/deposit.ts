import { sendMessage } from "../../utils/telegramApi";
import { getBalance } from "@/src/services/wallet";
import { createMainMenuKeyboard } from "@/src/utils/keyboards";
import { findUserByTelegramId } from "@/src/db/queries/users";
import { depositGameBet } from "@/src/solana/deposit";

export async function handleDeposit(chatId: string, telegramId: string, depositAmount: number) {

  const result = await depositGameBet(telegramId, depositAmount);
  const publicKey = await findUserByTelegramId(telegramId);


  if(result.status === 200) {

    const balance = await getBalance(publicKey.publicKey);

    await sendMessage(
      chatId,
      `Deposit successful! New balance: ${balance} SOL`
    );
  } else {
    await sendMessage(
      chatId,
      `Deposit failed!`
    );
  }
}

export async function handleCancelDeposit(chatId: string) {
  await sendMessage(
    chatId,
    "Deposit cancelled.",
    createMainMenuKeyboard()
  );
}

