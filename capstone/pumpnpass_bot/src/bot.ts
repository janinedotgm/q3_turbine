// src/bot.ts

import { handleMessage } from "./handlers/messageHandler";
import { handleCallbackQuery } from "./handlers/callbackQueryHandler";

export async function handleUpdate(update: any) {
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
  } else if (update.message) {
    await handleMessage(update.message);
  } else {
    console.log("Unsupported update type:", update);
  }
}
