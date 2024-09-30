import { randomInt } from "crypto";
import { PUMP_MIN_PRICE, PUMP_MAX_PRICE } from "@/src/utils/constants";
import { findUserByTelegramId } from "@/src/db/queries/users";
import { getCurrentPlayerRoundAndRound, updateCurrentPlayerRoundAndRound } from "@/src/db/queries/playerRound";
import { passToNextPlayer } from "@/src/gamelogic/initializeGame";


export const handlePass = async (chatId: string, telegramId: string) => {

    const player = await findUserByTelegramId(telegramId);
    
    if(!player) {
        throw new Error("Player not found");
    }
    
    const roundInfo = await getCurrentPlayerRoundAndRound(player.id);

    let round = roundInfo[0].round;
    let playerRound = roundInfo[0].playerRound;

    const {roundResult, playerRoundResult} = await updateCurrentPlayerRoundAndRound(round, playerRound, player.id);
    await passToNextPlayer(roundResult[0], roundResult[0], player.id);

}
