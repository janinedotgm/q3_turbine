// src/handlers/callbackQueryHandler.ts

import { sendMessage, answerCallbackQuery } from "../utils/telegramApi";
import { CALLBACK_DATA } from "../constants";
import { handleCheckBalance } from "./callbacks/checkBalance";
import { handleGetWalletKey } from "./callbacks/getWalletKey";

export async function handleCallbackQuery(callbackQuery: any) {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;
  const telegramId = callbackQuery.from.id.toString();

  switch (data) {
    case CALLBACK_DATA.CHECK_BALANCE:
      await handleCheckBalance(chatId, telegramId);
      break;
    case CALLBACK_DATA.GET_WALLET_KEY:
      await handleGetWalletKey(chatId, telegramId);
      break;
    default:
      await sendMessage(chatId, "Unknown action.");
  }

  // Acknowledge the callback query
  await answerCallbackQuery(callbackQuery.id);
}
