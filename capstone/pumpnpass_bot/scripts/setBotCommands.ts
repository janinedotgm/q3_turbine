// scripts/setBotCommands.ts

import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function setBotCommands() {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`;

    const commands = [
      { command: "start", description: "Start interacting with the bot" },
      { command: "rules", description: "Display the game rules" },
      { command: "support", description: "Get support information" },
      { command: "balance", description: "Check your balance" },
      { command: "pubkey", description: "Get your wallet key" },
      // Add more commands as needed
    ];

    const payload = {
      commands: commands,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if ((data as { ok: boolean; result: any }).ok) {
      console.log(
        "Bot commands set successfully:",
        (data as { ok: boolean; result: any }).result
      );
    } else {
      console.error("Error setting bot commands:", data);
    }
  } catch (error) {
    console.error("Error setting bot commands:", (error as Error).message);
  }
}

setBotCommands();
