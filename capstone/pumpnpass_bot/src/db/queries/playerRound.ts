import { db } from "@/src/db";
import { round } from "@/src/db/schema";
import { playerRound } from "@/supabase/migrations/schema";
import { UUID } from "crypto";

export const createPlayerRoundEntries = async (currentGame: any, currentRound: any) => {
    console.log("🚀 ~ createPlayerRoundEntries ~ currentRound:", currentRound)
    console.log("🚀 ~ createPlayerRoundEntries ~ currentRound.id:", currentRound.id)
    try {
       for (const player of currentGame.players) {
            console.log("🚀 ~ createPlayerRoundEntries ~ player:", player)
            
        await db.insert(playerRound).values({
            userId: player,
            gameId: currentGame.id,
            roundId: currentRound.id,
            roundPoints: 0,
            pumps: 0,
            turns: 0,
        });
       }
    } catch (error) {
        console.error(error);
        return null;
    }
}