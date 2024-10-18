import { sendMessage } from "../../utils/telegramApi";
import { createMainMenuKeyboard } from "../../utils/keyboards";
import { db } from '../../db/index';
import { getKeypair, encryptSecret } from "@/src/services/wallet";
import { users } from "@/src/db/schema";
import { findUserByTelegramId } from "@/src/db/queries/users";

export async function handleStartCommand(
  chatId: string,
  telegramId: string,
  username: string
) {
  try {
    const existingUser = await findUserByTelegramId(telegramId);

  if (existingUser) {
    await sendMessage(
      chatId,
      `Welcome back, ${existingUser.username}!`,
      createMainMenuKeyboard()
    );
  } else {
    // Create new user
    const keypair = await getKeypair();
    const secretData = encryptSecret(keypair.secretKey);

    const result = await db.insert(users).values({
      telegramId,
      publicKey: keypair.publicKey.toString(),
      username,
      authTag: secretData.authTag,
      iv: secretData.iv,
      secretKey: secretData.encrypted,
      chatId,
    });

    

    await sendMessage(
      chatId,
      `Successfully created your account, ${username}.`
      );

      // Send onboarding message with Markdown formatting
      const onboardingMessage = `
Welcome to the Game!

Important Information:
- This game is running on the Solana devnet. Please do not transfer real SOL to your wallet.
- We've funded your wallet with an airdrop of 1 SOL for you to participate in the game.

Game Rules:
1. Join the Game: Click the "Play Game" button to participate.
2. Deposit: Once enough players have joined, funds are deposited into an bucket on the blockchain. You can win funds from the bucket by scoring points.
3. Game Start: The game begins when all players have deposited their funds.
4. Gameplay:
   - The first player's turn starts.
   - Click the "Pump" button to earn points.
   - Be cautious! There's a limit to how many times you can pump before the item explodes.
   - If the item explodes, you lose all points for that round, and the next round starts.
   - If the item doesn't explode, choose to pass the item to the next player or pump again.
5. Rounds: The game consists of three rounds.
6. Scoring and Payout: After three rounds, points are calculated, and funds are distributed based on the points earned.

Enjoy the game and good luck!
`;

      await sendMessage(chatId, onboardingMessage, createMainMenuKeyboard());
    }
  } catch (error) {
    console.error(error);
    await sendMessage(
      chatId,
      "An error occurred. Please try again later.",
      createMainMenuKeyboard()
    );
  }
}
