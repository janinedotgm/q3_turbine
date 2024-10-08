import { findUserByTelegramId } from "@/src/db/queries/users";

const baseUrl = process.env.BASE_URL;

export const depositGameBet = async (telegramId: string, amount: number) => {

    const response = await fetch(`${baseUrl}/api/solana/deposit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId, amount }),   
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from server:", errorText);
        throw new Error(`Failed to initialize game on chain: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("🚀 ~ initializeGameOnChain ~ data:", data);
    return data;
};