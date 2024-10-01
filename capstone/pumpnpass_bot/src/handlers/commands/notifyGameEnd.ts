
import { sendMessage } from "../../utils/telegramApi";
import { findGameById } from "../../db/queries/game";
import { findUsersByIds } from "../../db/queries/users";

export const notifyGameEnd = async (player: any, playerGames: any[]) => {
    console.log("🚀 ~ notifyGameEnd ~ playerGame:", playerGames)
    console.log("🚀 ~ notifyGameEnd ~ player:", player)
    const playerNumber = playerGames.length;
    console.log("🚀 ~ notifyGameEnd ~ playerNumber:", playerNumber)
    const playerPosition = playerGames.findIndex((pg: any) => pg.userId === player.id);
    console.log("🚀 ~ notifyGameEnd ~ playerPosition:", playerPosition)
    
    switch(player.id){
        case playerGames[0].userId:
            sendMessage(player.telegramId, `You scored the most points with ${playerGames[playerPosition].totalPoints} points!`);
            break;
        case playerGames[playerNumber - 1].userId:
            sendMessage(player.telegramId, `You scored the least points with ${playerGames[playerPosition].totalPoints} points!`);
            break;
        default:
            sendMessage(player.telegramId, `You scored ${playerGames[playerPosition].totalPoints} points and finished in ${playerPosition + 1} place!`);
            break;
    }
    
}