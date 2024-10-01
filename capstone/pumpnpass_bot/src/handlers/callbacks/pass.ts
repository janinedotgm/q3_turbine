import { randomInt } from "crypto";
import { PUMP_MIN_PRICE, PUMP_MAX_PRICE } from "@/src/utils/constants";
import { findUserByTelegramId } from "@/src/db/queries/users";
import { getCurrentPlayerRoundAndRound, updateCurrentPlayerRoundAndRound } from "@/src/db/queries/playerRound";
import { passToNextPlayer } from "@/src/gamelogic/initializeGame";
import { sendPassedMsg } from "@/src/handlers/commands/gameMsg";
import { updatePlayerGameTotalPoints } from "@/src/db/queries/playerGame";


export const handlePass = async (chatId: string, telegramId: string) => {

    const player = await findUserByTelegramId(telegramId);
    
    if(!player) {
        throw new Error("Player not found");
    }
    
    const roundInfo = await getCurrentPlayerRoundAndRound(player.id);

    let round = roundInfo[0].round;
    let playerRound = roundInfo[0].playerRound;           

    // const result = await updatePlayerGameTotalPoints(round.gameId, playerRound.userId, playerRound.roundPoints);

    await passToNextPlayer(round, playerRound, player.id);
    sendPassedMsg(player);
}
