import { sendMessage } from "../../utils/telegramApi";
import { createGameActionKeyboard } from "../../utils/keyboards";

export const notifyNextPlayer = async (currentPlayer: any) => {
    await sendMessage(
        currentPlayer.chatId,
        `It's your turn to pump!`,
        createGameActionKeyboard()
      );
}