import { sendMessage } from "../../utils/telegramApi";
import { createGameActionKeyboard } from "../../utils/keyboards";

export const notifyFinalize = async (player: any) => {
  await sendMessage(player.telegramId, `Calculating payouts and distributing funds...`);
}