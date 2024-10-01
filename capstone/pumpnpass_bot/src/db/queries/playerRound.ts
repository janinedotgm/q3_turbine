import { db } from "@/src/db";
import { round } from "@/src/db/schema";
import { playerRound } from "@/supabase/migrations/schema";
import { UUID } from "crypto";
import { eq, and} from "drizzle-orm";

export const createPlayerRoundEntries = async (currentGame: any, currentRound: any, activePlayerId: string) => {
    try {
       for (const player of currentGame.players) {
            
            await db.insert(playerRound).values({
                userId: player,
                gameId: currentGame.id,
                roundId: currentRound.id,
                roundPoints: 0,
                pumps: 0,
                turns: activePlayerId === player ? 1 : 0,
            });
       }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const updatePlayerRound = async (newPlayerRound: any) => {
    const updatedPlayerRound = await db.update(playerRound).set({...newPlayerRound}).where(eq(playerRound.id, newPlayerRound.id));
    return updatedPlayerRound;
}

export const getPlayerRound = async (playerId: string, roundId: string) => {
    const results = await db.select().from(playerRound).where(and(eq(playerRound.userId, playerId), eq(playerRound.roundId, roundId)));
    return results;
}

export const getAllPlayerRoundsInRound = async (roundId: string) => {
    const results = await db.select().from(playerRound).where(eq(playerRound.roundId, roundId));
    return results;
}

export const getCurrentPlayerRoundAndRound = async (playerId: string) => {

    const results = await db
        .select()
        .from(playerRound)
        .innerJoin(round, eq(playerRound.roundId, round.id))
        .where(and(eq(playerRound.userId, playerId), eq(round.roundstatus, 'Active')));

    return results;
}

export const updateCurrentPlayerRoundAndRound = async (newRound: any, newPlayerRound: any, playerId: string) => {

    const transaction = await db.transaction(async (trx) => {
        // First, update the Round table based 
        const roundResult = await trx
            .update(round)
            .set({...newRound})
            .where(and(eq(round.id, newPlayerRound.roundId), eq(round.roundstatus, 'Active'))).returning(); 

        // Then, update the PlayerRound table
        const playerRoundResult = await trx
            .update(playerRound)
            .set({
                ...newPlayerRound,
            })
            .where(and(eq(playerRound.userId, playerId), eq(playerRound.id, newPlayerRound.id))).returning(); 

        return {roundResult, playerRoundResult};
    });

    return transaction;
}

export const updateAllPlayerRoundsAndRound = async (newRound: any, newPlayerRound: any) => {
    const transaction = await db.transaction(async (trx) => {
        // First, update the Round table based 
        const roundResult = await trx
            .update(round)
            .set({...newRound})
            .where(and(eq(round.id, newPlayerRound.roundId), eq(round.roundstatus, 'Active'))).returning(); 

        // Then, update the PlayerRound table
        const playerRoundResult = await trx
            .update(playerRound)
            .set({
                ...newPlayerRound,
            })
            .where(eq(playerRound.roundId, newPlayerRound.roundId)).returning(); 

        return {roundResult, playerRoundResult};
    });

}

