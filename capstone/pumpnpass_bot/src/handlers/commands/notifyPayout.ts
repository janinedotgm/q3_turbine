import { sendMessage } from "../../utils/telegramApi";
import { createGameActionKeyboard, createMainMenuKeyboard } from "../../utils/keyboards";
import { getBalance } from "@/src/services/wallet";

export const notifyPayout = async (player: any) => {
  const balance = await getBalance(player.publicKey);
  await sendMessage(player.telegramId, `Payout successful! New balance: ${balance} SOL`, createMainMenuKeyboard());
}