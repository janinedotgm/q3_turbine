import { db } from "@/src/db";
import { game, round } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export const findOpenGame = async () => {
    try {
        const openGame = await db.select().from(game).where(eq(game.gamestatus, 'Open')).limit(1).then((games) => games[0] || null);
        return openGame;
    } catch (error) {
        console.error(error);
        return null;
    }
 
};

export const findGameById = async (gameId: string) => {
    try {
        const result = await db.select().from(game).where(eq(game.id, gameId)).limit(1).then((games) => games[0] || null);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const createGame = async (players: string[]) => {
    try {
        const newGame = await db.insert(game).values({ players: players, gamestatus: 'Open' }).returning();
        return newGame;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const joinGame = async (gameId: string, players: string[]) => {
    try {
        // TODO: implement game status for multiple players
        const updatedGame = await db.update(game).set({ players: players, gamestatus: 'Active' }).where(eq(game.id, gameId));
       
        return updatedGame;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const updateGameSeed = async (gameId: string, seed: string) => {
    try {
        const updatedGame = await db.update(game).set({ seed: seed }).where(eq(game.id, gameId));
        return updatedGame;
    } catch (error) {
        console.error(error);
        return null;
    }
}


export const getCurrentRoundAndGame = async (gameId: string) => {

    const results = await db
        .select()
        .from(round)
        .innerJoin(game, eq(round.gameId, game.id))
        .where(eq(round.gameId, gameId));

    return results;
}

// export const getCurrentPlayerRoundAndRound = async (playerId: string) => {

//     const results = await db
//         .select()
//         .from(playerRound)
//         .innerJoin(round, eq(playerRound.roundId, round.id))
//         .where(and(eq(playerRound.userId, playerId), eq(round.roundstatus, 'Active')));

//     return results;
// }
