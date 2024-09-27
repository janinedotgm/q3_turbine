// src/utils/telegramApi.ts

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}`;

export const sendMessage = async (
  chatId: string,
  text: string,
  replyMarkup?: object
) => {
  const url = `${TELEGRAM_API_URL}/sendMessage`;

  const messageData = {
    chat_id: chatId,
    text,
    parse_mode: "HTML", // Optional, if you use HTML formatting
    ...(replyMarkup && { reply_markup: JSON.stringify(replyMarkup) }),
  };

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  });
};

export const answerCallbackQuery = async (callbackQueryId: string) => {
  const url = `${TELEGRAM_API_URL}/answerCallbackQuery`;

  const payload = {
    callback_query_id: callbackQueryId,
  };

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};
