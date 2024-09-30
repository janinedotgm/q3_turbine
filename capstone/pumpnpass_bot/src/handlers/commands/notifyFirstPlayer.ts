import { sendMessage } from "../../utils/telegramApi";
import { createGameActionKeyboard } from "../../utils/keyboards";

export const notifyFirstPlayer = async (currentPlayer: any) => {
    await sendMessage(
        currentPlayer.chatId,
        `The first round has started! It's your turn to pump!`,
        createGameActionKeyboard()
      );
}