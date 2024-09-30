import { game } from "@/src/db/schema";
import { createPlayerRoundEntries } from "@/src/db/queries/playerRound";
import { createPlayerGameEntries } from "@/src/db/queries/playerGame"; 
import { createRoundEntry } from "@/src/db/queries/round";
import { findGameById } from "@/src/db/queries/game";
import { findUsersByIds, findUserById } from "@/src/db/queries/users";
import { MAX_ROUNDS } from "@/src/utils/constants";
import { updatePlayerGameTotalPoints } from "@/src/db/queries/playerGame";
import { notifyNextPlayer } from "@/src/handlers/commands/notifyNextPlayer";
import { randomInt } from "crypto";
import { updateRound } from "@/src/db/queries/round";

export const initializeGame = async (chatId: string, currentGame: any) => {

    // Create first round
    const newRound = await initializeRound(currentGame);

    // Create PlayerGame entry in db
    await createPlayerGameEntries(currentGame);

    // Create PlayerRound entry in db
    await createPlayerRoundEntries(currentGame, newRound, newRound?.activePlayerId ?? '');

    // TODO: initialize on chain

    return newRound;
}

const initializeRound = async (currentGame: any) => {
    const activePlayerId = getNextActivePlayer(currentGame.players, null);
    
    const newRound = await createRoundEntry(currentGame, 0, activePlayerId);
    return newRound;
}

export const endRound = async (currentRound: any, playerRound: any) => {
    const game = await findGameById(currentRound.gameId);

    if(!game) {
        throw new Error("Game not found");
    }

    const players = game.players;
    if(!players) {
        throw new Error("Players not found");
    }

    await updatePlayerGameTotalPoints(playerRound.gameId, playerRound.userId, playerRound.roundPoints);

    if(currentRound.number >= MAX_ROUNDS){
        //finish game
        await finishGame(game);
    }else{
        // next round
        await nextRound(game, currentRound.number + 1, currentRound.activePlayerId);
        
    }

}

const finishGame = async (game: any) => {
    // TODO: finish game
    console.log('TODO:implement finish game');
}

const nextRound = async (game: any, nextRoundNumber: number, lastActivePlayerId: string) => {
    const nextActivePlayerId = getNextActivePlayer(game.players, lastActivePlayerId);
    // create new round wiht next number
    const newRound = await createRoundEntry(game, nextRoundNumber, nextActivePlayerId);

    // create playerRound entries
    await createPlayerRoundEntries(game, newRound, newRound?.activePlayerId ?? '');

    const currentPlayer = await findUserById(nextActivePlayerId);

    notifyNextPlayer(currentPlayer);
}

const getNextActivePlayer = (playersInGame: string[], lastActivePlayerId: string | null) => {
    let possibleNextPlayers = playersInGame;
    let substractor = 1;

    if(lastActivePlayerId !== null){
        possibleNextPlayers = playersInGame.filter((player: any) => player !== lastActivePlayerId);
        substractor +=1;
    }

    if(possibleNextPlayers.length === 1){
        return possibleNextPlayers[0];
    }else{
        const playerIndex = randomInt(1, possibleNextPlayers.length-substractor);
        return playersInGame[playerIndex];
    }

}

export const passToNextPlayer = async (round: any, playerRound: any, lastActivePlayerId: string) => {
    const game = await findGameById(round.gameId);
    if(!game) {
        throw new Error("Game not found");
    }
    const players = game.players;
    if(!players) {
        throw new Error("Players not found");
    }
    const nextActivePlayerId = getNextActivePlayer(players, lastActivePlayerId);   

    round.activePlayerId = nextActivePlayerId;
    await updateRound(round.id, round);
    // create playerRound entries
    await createPlayerRoundEntries(game, playerRound, nextActivePlayerId);
    const currentPlayer = await findUserById(nextActivePlayerId);
    notifyNextPlayer(currentPlayer);
}