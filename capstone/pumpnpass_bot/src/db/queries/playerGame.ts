import { db } from "@/src/db";
import { playerGame } from "@/src/db/schema";

export const createPlayerGameEntries = async (currentGame: any) => {
    try {
       for (const player of currentGame.players) {
                await db.insert(playerGame).values({
                    userId: player,
                    gameId: currentGame.id,
                    totalPoints: 0,
        });
       }
    } catch (error) {
        console.error(error);
        return null;
    }
}