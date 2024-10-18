// src/utils/keyboards.ts

import { CALLBACK_DATA } from "./constants";

// Main Menu Inline Keyboard
export const createMainMenuKeyboard = () => ({
  inline_keyboard: [
    [
      { text: "Play Game", callback_data: CALLBACK_DATA.START_NEW_GAME },
    ],
    [
      { text: "Get Wallet", callback_data: CALLBACK_DATA.GET_WALLET_KEY },
      { text: "Check Balance", callback_data: CALLBACK_DATA.CHECK_BALANCE }
    ],
  ],
});

// Game Action Inline Keyboard
export const createGameActionKeyboard = () => ({
  inline_keyboard: [
    [
      { text: "Pump", callback_data: CALLBACK_DATA.GAME_PUMP },
      { text: "Pass", callback_data: CALLBACK_DATA.GAME_PASS },
      
    ],
  ],
});

export const createTopUpKeyboard = (mercuryoUrl: string) => ({
  inline_keyboard: [
    [
      { text: "Buy SOL", url: mercuryoUrl },
    ],
    [
      { text: "Get Wallet", callback_data: CALLBACK_DATA.GET_WALLET_KEY },
      { text: "Check Balance", callback_data: CALLBACK_DATA.CHECK_BALANCE }
    ],
  ],
});

// Deposit Keyboard
export const createDepositKeyboard = (depositPerPlayer: number) => ({
  inline_keyboard: [
    [
      { text: `Deposit ${depositPerPlayer} SOL`, callback_data: `DEPOSIT_${depositPerPlayer}` },
      { text: "Cancel", callback_data: "CANCEL_DEPOSIT" }
    ],
  ],
});
