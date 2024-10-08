import { sendMessage } from "../../utils/telegramApi";

export const notifyWaitingPlayers = async (players: any[]) => {
   players.forEach(async player => {
    await sendMessage(
      player.chatId,
      `The item was passed, be patient, your turn will come soon!`
    );
   })
}