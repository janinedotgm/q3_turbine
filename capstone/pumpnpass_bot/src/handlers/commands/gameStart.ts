import { sendMessage } from "../../utils/telegramApi";

export const sendGameStartMsg = async (chatId: any) => {
  await sendMessage(
      chatId,
      `Game is starting! Get ready to pump!`,
    );
}

