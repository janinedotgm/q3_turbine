import { db } from "@/src/db";
import { playerGame } from "@/src/db/schema";
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

export const updatePlayerGameTotalPoints = async (gameId: string, userId: string, totalPoints: number) => {

    const results = await db.select().from(playerGame).where(and(eq(playerGame.gameId, gameId), eq(playerGame.userId, userId)));

    if(results.length !== 1) {
        throw new Error("A user can only have one playerGame entry per game");
    }

    await db.update(playerGame).set({totalPoints: results[0].totalPoints + totalPoints}).where(and(eq(playerGame.gameId, gameId), eq(playerGame.userId, userId)));
}
