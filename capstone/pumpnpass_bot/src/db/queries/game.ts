import { db } from "@/src/db";
import { game } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export const findOpenGame = async () => {
    try {
        const openGame = await db.select().from(game).where(eq(game.gamestatus, 'Open')).limit(1).then((games) => games[0] || null);
        return openGame;
    } catch (error) {
        console.error(error);
        return null;
    }
 
};

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

