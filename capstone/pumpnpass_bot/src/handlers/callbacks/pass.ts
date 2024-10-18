import { findUserByTelegramId } from "@/src/db/queries/users";
import { getCurrentPlayerRoundAndRound } from "@/src/db/queries/playerRound";
import { passToNextPlayer } from "@/src/gamelogic/initializeGame";
import { sendPassedMsg } from "@/src/handlers/commands/gameMsg";


export const handlePass = async (chatId: string, telegramId: string) => {

    const player = await findUserByTelegramId(telegramId);
    
    if(!player) {
        throw new Error("Player not found");
    }
    
    const roundInfo = await getCurrentPlayerRoundAndRound(player.id);

    const round = roundInfo[0].round;
    const playerRound = roundInfo[0].playerRound;           

    // const result = await updatePlayerGameTotalPoints(round.gameId, playerRound.userId, playerRound.roundPoints);

    await passToNextPlayer(round, playerRound, player.id);
    sendPassedMsg(player);
}
