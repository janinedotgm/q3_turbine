// src/handlers/commands/startCommand.ts

import { sendMessage } from "../../utils/telegramApi";
import { createMainMenuKeyboard } from "../../utils/keyboards";
import { dbClient } from "@/src/services/db";
import { getKeypair, encryptSecret } from "@/src/services/wallet";

export async function handleStartCommand(
  chatId: string,
  telegramId: string,
  username: string
) {
  const existingUser = await dbClient.user.findUnique({
    where: { telegramId },
  });

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

    const user = await dbClient.user.create({
      data: {
        telegramId,
        username,
        publicKey: keypair.publicKey.toString(),
        secretKey: secretData.encrypted,
        authTag: secretData.authTag,
        iv: secretData.iv,
      },
    });

    await sendMessage(
      chatId,
      `Successfully created your account, ${user.username}.`,
      createMainMenuKeyboard()
    );
  }
}
