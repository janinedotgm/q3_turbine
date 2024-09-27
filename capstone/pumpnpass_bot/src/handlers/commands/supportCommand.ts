import { sendMessage } from "../../utils/telegramApi";
import { createMainMenuKeyboard } from "../../utils/keyboards";

export async function handleSupportCommand(chatId: string) {
  await sendMessage(
    chatId,
    "For support, please join our chat and ask questions: https://t.me/pumpnpasschat",
    createMainMenuKeyboard()
  );
}
