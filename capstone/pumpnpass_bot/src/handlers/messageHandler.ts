// src/handlers/messageHandler.ts

import { sendMessage } from "../utils/telegramApi";
import { createMainMenuKeyboard } from "../utils/keyboards";
import { handleStartCommand } from "./commands/startCommand";
import { handleUnknownCommand } from "./commands/unknownCommand";
import { handleRulesCommand } from "./commands/rulesCommand";
import { handleSupportCommand } from "./commands/supportCommand";

export async function handleMessage(message: any) {
  const text = message.text;
  const chatId = message.chat.id;
  const telegramId = message.from.id.toString();
  const username = message.from.username.toString();

  if (text.startsWith("/")) {
    await handleCommand(text, chatId, telegramId, username);
  } else {
    // Optionally inform the user to use the buttons
    await sendMessage(
      chatId,
      "Please use the buttons below to interact with the bot.",
      createMainMenuKeyboard()
    );
  }
}

async function handleCommand(
  command: string,
  chatId: string,
  telegramId: string,
  username: string
) {
  switch (command) {
    case "/start":
      await handleStartCommand(chatId, telegramId, username);
      break;
    case "/rules":
      await handleRulesCommand(chatId);
      break;
    case "/support":
      await handleSupportCommand(chatId);
      break;
    default:
      await handleUnknownCommand(chatId);
  }
}
