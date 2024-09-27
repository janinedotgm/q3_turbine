
import { sendMessage } from "../../utils/telegramApi";
import { findUserByTelegramId } from "@/src/db/queries/users";
import { getBalance } from "@/src/services/wallet";
import { createMainMenuKeyboard } from "@/src/utils/keyboards";
import { findOpenGame, joinGame, createGame } from "@/src/db/queries/game";
import { initializeGame } from "@/src/gamelogic/initializeGame";

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
    await sendMessage(
      chatId,
      "You need 0.01 SOL to start a new game. Please top up your wallet first.",
      createMainMenuKeyboard()
    );
    return;
  } else {
    const openGame = await findOpenGame();

    if(openGame) {
      if(openGame.players !== null){
        openGame.players.push(existingUser.id);
        await joinGame(openGame.id, openGame.players);
        
        initializeGame(chatId, openGame);

        await sendMessage(
          chatId,
          "You have joined the game. It will start in a few seconds.",
        );
        return;
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