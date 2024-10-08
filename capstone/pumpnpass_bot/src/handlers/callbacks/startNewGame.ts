import { sendMessage } from "../../utils/telegramApi";
import { findUserByTelegramId } from "@/src/db/queries/users";
import { getBalance } from "@/src/services/wallet";
import { createGameActionKeyboard, createTopUpKeyboard } from "@/src/utils/keyboards";
import { findOpenGame, joinGame, createGame } from "@/src/db/queries/game";
import { initializeGame } from "@/src/gamelogic/initializeGame";
import { findUserById } from "@/src/db/queries/users";
import { notifyFirstPlayer } from "../commands/notifyFirstPlayer";
import { createHash } from "crypto";

const createMercuryoUrl = (publicKey: string) => {
  const address = publicKey;
  const secret = 'secret';

  // Generate the signature using sha512
  const signatureInput = `${address}${secret}`;
  const signature = createHash('sha512').update(signatureInput).digest('hex');

  const baseUrl = 'https://exchange.mercuryo.io/';
  const widgetId = '5383c58a-0f6a-45cd-937a-bc2c79e18076';

  // Defining query parameters
  const params = {
    widget_id: widgetId,
    type: 'sell',
    currency: 'SOL',
    network: 'SOLANA',
    amount: 0.2,
    fiat_currency: 'EUR',
    address: address,
    signature: signature,
  };

  // Convert all values in params to strings
  const stringParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  );

  // Function to serialize the parameters as query string
  const queryString = new URLSearchParams(stringParams).toString();
  const finalUrl = `${baseUrl}?${queryString}`;

  return finalUrl;
};

export async function handleStartNewGame(chatId: string, telegramId: string) {
  const existingUser = await findUserByTelegramId(telegramId);
  
  if (!existingUser) {
    await sendMessage(
      chatId,
      "User not found. Please send /start to register."
    );
    return;
  }

  const balance = await getBalance(existingUser.publicKey);
  
  if (balance < 0.01) {
    const mercuryoUrl = createMercuryoUrl(existingUser.publicKey);
    await sendMessage(
      chatId,
      `You need 0.01 SOL to start a new game. Please top up your wallet first.`,
      createTopUpKeyboard(mercuryoUrl)
    );
    return;
  } else {
    const openGame = await findOpenGame();

    if(openGame) {
      if(openGame.players !== null){
        openGame.players.push(existingUser.id);
        await joinGame(openGame.id, openGame.players);

        await sendMessage(
          chatId,
          "You have joined the game. It will start in a few seconds.",
        );

        const newRound = await initializeGame(chatId, openGame);
      }
    } else {
      const newGame = await createGame([existingUser.id]);

      await sendMessage(
        chatId,
        "Waiting for other players to join...",
      );
      return;
    }
  }
}