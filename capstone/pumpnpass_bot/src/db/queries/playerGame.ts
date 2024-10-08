import { db } from "@/src/db";
import { playerGame, users } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

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

export const getPlayerGamesForGame = async (gameId: string) => {
    const results = await db.select().from(playerGame).where(eq(playerGame.gameId, gameId));
    return results;
}

export const updatePlayerGameTotalPoints = async (gameId: string, userId: string, totalRoundPoints: number) => {

    const results = await db.select().from(playerGame).where(and(eq(playerGame.gameId, gameId), eq(playerGame.userId, userId)));
    const currentPlayerGame = results[0];
    
    if(results.length !== 1) {
        throw new Error("A user can only have one playerGame entry per game");
    }

    await db.update(playerGame).set({totalPoints: currentPlayerGame.totalPoints + totalRoundPoints}).where(and(and(eq(playerGame.gameId, gameId), eq(playerGame.userId, userId))));
}

export const getPlayerGameByUserId = async (userId: string) => {
    const results = await db.select().from(playerGame).where(eq(playerGame.userId, userId));
    return results;
}
