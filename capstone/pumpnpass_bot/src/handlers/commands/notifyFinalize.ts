import { sendMessage } from "../../utils/telegramApi";

export const notifyFinalize = async (player: any) => {
  await sendMessage(player.telegramId, `Calculating payouts and distributing funds...`);
}