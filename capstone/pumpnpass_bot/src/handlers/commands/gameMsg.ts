import { sendMessage } from "../../utils/telegramApi";
import { createGameActionKeyboard } from "../../utils/keyboards";

export const sendPumpSuccessMsg = async (currentPlayer: any, playerRound: any) => {
    await sendMessage(
        currentPlayer.chatId,
        `Lucky you! You pumped successfully, wanna try again? Points in this round: ${playerRound.roundPoints}`,
        createGameActionKeyboard()
      );
}

export const sendPumpFailedMsg = async (currentPlayer: any) => {
    await sendMessage(
        currentPlayer.chatId,
        `Ooh no! You failed to pump and lost all your points in this round!`,
      );
}

export const sendPassedMsg = async (currentPlayer: any) => {
  await sendMessage(
      currentPlayer.chatId,
      `You passed the turn to the next player! Let's wait for your next turn.`,
    );
}

