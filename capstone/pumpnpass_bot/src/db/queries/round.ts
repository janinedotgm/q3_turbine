import { db } from "@/src/db";
import { playerGame } from "@/src/db/schema";
import { UUID } from "crypto";
import { round } from "@/src/db/schema";
import { playerRound } from "@/supabase/migrations/schema";
import { randomInt } from "crypto";

export const createPlayerRoundEntries = async (currentGame: any) => {
    try {
        const playerIndex = randomInt(0, currentGame.players.length - 1);
        const newRound = await db.insert(round).values({
            gameId: currentGame.id,
            maxPumps: randomInt(1, 75),
            currentPumps: 0,
            roundstatus: 'Active',
            looserId: null,
            number: 0,
            activePlayerId: currentGame.players[playerIndex].id as UUID,
        });
        console.log("🚀 ~ newRound ~ newRound:", newRound)

    } catch (error) {
        console.error(error);
        return null;
    }
}