import { sendMessage } from "../../utils/telegramApi";
import { DEPOSIT_PER_PLAYER } from "../../utils/constants";
import { createDepositKeyboard } from "../../utils/keyboards";

export const sendGameStartMsg = async (chatId: any) => {
  await sendMessage(
      chatId,
      `Game is starting! It's time to set your bets. Every player has to deposit ${DEPOSIT_PER_PLAYER} SOL to start the game.`,
    createDepositKeyboard(DEPOSIT_PER_PLAYER)
  );
}

