// src/handlers/commands/unknownCommand.ts

import { sendMessage } from "../../utils/telegramApi";
import { createMainMenuKeyboard } from "../../utils/keyboards";

export async function handleUnknownCommand(chatId: string) {
  await sendMessage(
    chatId,
    "Sorry, I didn't understand that command. Please use the buttons below.",
    createMainMenuKeyboard()
  );
}
