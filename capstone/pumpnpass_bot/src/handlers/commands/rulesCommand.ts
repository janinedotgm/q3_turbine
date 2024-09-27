// src/handlers/commands/rulesCommand.ts

import { sendMessage } from "../../utils/telegramApi";
import { createMainMenuKeyboard } from "../../utils/keyboards";

export async function handleRulesCommand(chatId: string) {
  const rulesText = `Here are the game rules:
  - Rule 1: ...
  - Rule 2: ...
  - Rule 3: ...
  Enjoy the game!`;

  await sendMessage(chatId, rulesText, createMainMenuKeyboard());
}
