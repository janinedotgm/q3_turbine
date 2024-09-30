import { game } from "@/src/db/schema";
import { createPlayerRoundEntries } from "@/src/db/queries/playerRound";
import { createPlayerGameEntries } from "@/src/db/queries/playerGame"; 
import { createRoundEntry } from "@/src/db/queries/round";

export const initializeGame = async (chatId: string, currentGame: any) => {
    console.log("🚀 ~ initializeGame ~ currentGame:", currentGame.players)

    // Create first round
    const newRound = await initializeRound(currentGame);
    console.log("🚀 ~ initializeGame ~ newRound:", newRound);

    // Create PlayerGame entry in db
    await createPlayerGameEntries(currentGame);

    // Create PlayerRound entry in db
    await createPlayerRoundEntries(currentGame, newRound);

    // Call initialize on chain
}

const initializeRound = async (currentGame: typeof game) => {
    const newRound = await createRoundEntry(currentGame);
    console.log("🚀 ~ initializeRound ~ newRound:", newRound)
    return newRound;
}