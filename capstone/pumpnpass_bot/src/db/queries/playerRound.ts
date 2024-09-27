import { db } from "@/src/db";
import { playerGame } from "@/src/db/schema";
import { UUID } from "crypto";
import { game } from "@/src/db/schema";

export const createPlayerRoundEntries = async (currentGame: any) => {
    try {
       for (const player of currentGame.players) {
            
        await db.insert(playerGame).values({
            userId: player.id,
            gameId: currentGame.id,
            totalPoints: 0,
        });
       }
    } catch (error) {
        console.error(error);
        return null;
    }
}