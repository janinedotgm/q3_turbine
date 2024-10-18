// src/handlers/callbackQueryHandler.ts

import { sendMessage, answerCallbackQuery } from "../utils/telegramApi";
import { CALLBACK_DATA } from "../utils/constants";
import { 
  handleCheckBalance, 
  handleGetWalletKey, 
  handleStartNewGame, 
  handlePump, 
  handlePass, 
  handleDeposit,
  handleCancelDeposit 
} from "./callbacks";

export async function handleCallbackQuery(callbackQuery: any) {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;
  const telegramId = callbackQuery.from.id.toString();

  const depositMatch = data.match(/^DEPOSIT_(\d+(\.\d+)?)$/);

  if (depositMatch) {
    const depositAmount = parseFloat(depositMatch[1]);
    await handleDeposit(chatId, telegramId, depositAmount);
  } else {
      switch (data) {
      case CALLBACK_DATA.CHECK_BALANCE:
        await handleCheckBalance(chatId, telegramId);
        break;
      case CALLBACK_DATA.GET_WALLET_KEY:
        await handleGetWalletKey(chatId, telegramId);
        break;
      case CALLBACK_DATA.START_NEW_GAME:
        await handleStartNewGame(chatId, telegramId);
        break;
      case CALLBACK_DATA.GAME_PUMP:
        await handlePump(chatId, telegramId);
        break;
      case CALLBACK_DATA.GAME_PASS:
        await handlePass(chatId, telegramId);
        break;
      case CALLBACK_DATA.CANCEL_DEPOSIT:
        await handleCancelDeposit(chatId, telegramId);
        break;
      default:
        await sendMessage(chatId, "Unknown action.");
    }
  }

  // Acknowledge the callback query
  await answerCallbackQuery(callbackQuery.id);
}
