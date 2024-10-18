import { db } from "@/src/db";
import { round } from "@/src/db/schema";
import { randomInt } from "crypto";
import { PUMP_MIN_AMOUNT, PUMP_MAX_AMOUNT } from "@/src/utils/constants";
import { eq } from "drizzle-orm";

export const createRoundEntry = async (currentGame: any, roundNumber: number, activePlayerId: string) => {
    try {
        const newRound = await db.insert(round).values({
            gameId: currentGame.id,
            maxPumps: randomInt(PUMP_MIN_AMOUNT, PUMP_MAX_AMOUNT),
            currentPumps: 0,
            roundstatus: 'Active',
            looserId: null,
            number: roundNumber,
            activePlayerId: activePlayerId,
        }).returning();

        return newRound != null ? newRound[0] : null;

    } catch (error) {
        console.error(error);
        return null;
    }
}

export const updateRound = async (newRound: any) => {
    const updatedRound = await db.update(round).set({...newRound}).where(eq(round.id, newRound.id));
    return updatedRound;
}

