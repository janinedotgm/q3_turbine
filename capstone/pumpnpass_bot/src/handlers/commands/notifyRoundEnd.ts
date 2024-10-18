
import { findUserById } from "@/src/db/queries/users";
import { sendMessage } from "../../utils/telegramApi";
import { MAX_ROUNDS } from "@/src/utils/constants";

export const notifyRoundEnd = async (playerId: any, roundPoints: number, roundsLeft: number) => {
    const player = await findUserById(playerId);

    sendMessage(player.telegramId, `Round ended! You scored ${roundPoints} points in this round! ${MAX_ROUNDS+1 - roundsLeft} rounds left!`);
    
}