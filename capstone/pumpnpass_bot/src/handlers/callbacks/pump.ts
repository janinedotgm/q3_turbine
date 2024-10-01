import { randomInt } from "crypto";
import { PUMP_MIN_PRICE, PUMP_MAX_PRICE } from "@/src/utils/constants";
import { findUserByTelegramId } from "@/src/db/queries/users";
import { getCurrentPlayerRoundAndRound, updateCurrentPlayerRoundAndRound } from "@/src/db/queries/playerRound";
import { endRound } from "@/src/gamelogic/initializeGame";
import { sendPumpSuccessMsg, sendPumpFailedMsg, sendPassedMsg } from "@/src/handlers/commands/gameMsg";

/**
 * Triggered when player pumps
 * 
 * @param chatId current players chat id
 * @param telegramId current players telegram id
 */
export const handlePump = async (chatId: string, telegramId: string) => {

    // get player from users table
    const player = await findUserByTelegramId(telegramId);
    
    if(!player) {
        throw new Error("Player not found");
    }

    const roundInfo = await getCurrentPlayerRoundAndRound(player.id);

    let round = roundInfo[0].round;
    let playerRound = roundInfo[0].playerRound;

    if(PUMP_MIN_PRICE >= round.maxPumps - round.currentPumps){
        sendPumpFailedMsg(player);
        
        round.roundstatus = 'Finished';
        round.looserId = player.id;
        round.activePlayerId = null;
        playerRound.roundPoints = 0;
        playerRound.pumps += 1;

        const result = await updateCurrentPlayerRoundAndRound(round, playerRound, player.id);
        await endRound(round);
    }else {
        const price = randomInt(PUMP_MIN_PRICE, round.maxPumps - round.currentPumps);

        round.currentPumps += price;

        // Pump is successful, update player round and round
        playerRound.pumps += 1;
        playerRound.roundPoints += 1;

        const result = await updateCurrentPlayerRoundAndRound(round, playerRound, player.id);

        sendPumpSuccessMsg(player, result.playerRoundResult[0]);
    }


}
