import { game } from "@/src/db/schema";
import { createPlayerGameEntries } from "@/src/db/queries/playergame";
export const initializeGame = async (chatId: string, currentGame: typeof game) => {
    console.log("🚀 ~ initializeGame ~ currentGame:", currentGame.players)

    // Create PlayerGame entry in db
    await createPlayerGameEntries(currentGame);
    // Create PlayerRound entry in db
    // Call initialize on chain
}
