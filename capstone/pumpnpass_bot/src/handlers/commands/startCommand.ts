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
    const keypair = getKeypair();
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
      `Successfully created your account, ${username}.`,
      createMainMenuKeyboard()
      );
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
