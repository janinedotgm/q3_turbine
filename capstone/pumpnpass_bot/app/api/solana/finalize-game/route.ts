import { NextRequest, NextResponse } from "next/server";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor"; 
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; 
import { loadKeypair, readSeedFromFile } from '../../../../src/utils/chainhelpers';
import { decrypt } from '../../../../src/services/encryption';
import { findUserByTelegramId } from '../../../../src/db/queries/users';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { findActiveGameByUserId, findFinalizingGameByUserId } from '../../../../src/db/queries/game';
import { startGame } from '../../../../src/gamelogic/initializeGame';

const PROGRAM_ID = new PublicKey('67zrcgrGfk4NGR6YTQNoqZhSxbhq87ZTPZFZvdQyJ3vz');
const connection = new Connection(process.env.RPC_URL ?? '', 'confirmed');

const payer = loadKeypair(`/payer-keypair.json`);

const baseUrl = process.env.BASE_URL;

const calculateShare = (playerScore: number, totalScore: number) => {
    if(totalScore === 0) return 0;
    
    const payout = (playerScore / totalScore);
    const formattedPayout = payout.toFixed(2); // Format to 2 decimal places
    return parseFloat(formattedPayout); // Return as a number
}

const saveScoreOnChain = async (player: any, payout: number, escrow: string, seedHex: string) => {
    console.log("🚀 ~ saveScoreOnChain ~ player... route finalize game")
    const response = await fetch(`${baseUrl}/api/solana/save-payout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player, payout, escrow, seedHex }),   
    });

} 

export async function POST(request: NextRequest) {
    try {
        console.log("🚀 ~ finalization triggered... ------------------")
        const { playerGames } = await request.json();

        if (!playerGames) {
            return NextResponse.json({ status: 400, message: "Player games required" });
        }

        console.log("🚀 ~ finalization triggered... ------------------ 1")
        const wallet = new NodeWallet(payer);
        const anchorWallet = wallet as anchor.Wallet;
        const provider = new anchor.AnchorProvider(connection, anchorWallet, { preflightCommitment: "confirmed" });
        anchor.setProvider(provider);
        const program = new anchor.Program<PumpNPass>(IDL, provider);
        console.log("🚀 ~ finalization triggered... ------------------ 2")

        const game = await findFinalizingGameByUserId(playerGames[0].userId);
        if(game.length === 0 || game.length > 1) {
            console.log("🚀 ~ finalization failes because game not found")
            return NextResponse.json({ status: 400, message: "Failed to find active game" });
        }
        console.log("🚀 ~ finalization triggered... ------------------ 3")
        if (!game || !game[0].deposit_per_player) {
            return NextResponse.json({ status: 400, message: "Game not found" });
        }
        console.log("🚀 ~ finalization triggered... ------------------ 4")
        const depositPerPlayer = parseFloat(game[0].deposit_per_player);

        const seedHex = game[0].seed;
        if(!seedHex){
            return NextResponse.json({ status: 400, message: "Seed not found" });
        }
        console.log("🚀 ~ finalization triggered... ------------------ 5")
        const seed = new anchor.BN(seedHex, 'hex'); // Convert from hex

        const [escrow] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("escrow"), 
                payer.publicKey.toBuffer(),
                seed.toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );
        console.log("🚀 ~ finalization triggered... ------------------ 6")
        const deposits = depositPerPlayer * playerGames.length;

        let totalpoints = 0;
        for(const playerGame of playerGames){
            totalpoints += parseInt(playerGame.totalPoints);
        }

        console.log("🚀 ~ totalpoints:", totalpoints)
        console.log("🚀 ~ finalization triggered... ------------------ 7")
        for(const playerGame of playerGames){
            const share = calculateShare(parseInt(playerGame.totalPoints), totalpoints);
            const payout = share * deposits;
            console.log("🚀 ~ payout:", payout)
            await saveScoreOnChain(playerGame, payout, escrow.toString(), seedHex);
        }

        




        // const result = await fetch(`${baseUrl}/api/check-deposits`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ player })    
        // });

        // // const deposits = await result.json();
        // console.log("🚀 ~ POST ~ deposits:");
        
    
        


    return NextResponse.json({ status: 200, message: "Distribution successful" });
  } catch (error) {
    console.error("Error distributing funds:", error);
    return NextResponse.json(
      { error: "Error distributing funds" },
      { status: 500 }
    );
  }
}
