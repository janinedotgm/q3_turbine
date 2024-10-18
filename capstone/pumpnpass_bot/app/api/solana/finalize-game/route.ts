import { NextRequest, NextResponse } from "next/server";
import * as anchor from "@coral-xyz/anchor"; 
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; 
import { loadKeypair,  } from '../../../../src/utils/chainhelpers';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { findFinalizingGameByUserId } from '../../../../src/db/queries/game';

const connection = new Connection(process.env.RPC_URL ?? '', 'confirmed');

const baseUrl = process.env.BASE_URL;

const calculateShare = (playerScore: number, totalScore: number) => {
    if(totalScore === 0) return 0;
    
    const payout = (playerScore / totalScore);
    const formattedPayout = payout.toFixed(2); // Format to 2 decimal places
    return parseFloat(formattedPayout); // Return as a number
}

const saveScoreOnChain = async (player: any, payout: number, escrow: string, seedHex: string) => {
    await fetch(`${baseUrl}/api/solana/save-payout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player, payout, escrow, seedHex }),   
    });

} 

export async function POST(request: NextRequest) {
    try {
        const { playerGames } = await request.json();

        if (!playerGames) {
            return NextResponse.json({ status: 400, message: "Player games required" });
        }

        const payer = loadKeypair();

        if(!payer) {
            return NextResponse.json({ status: 400, message: "Failed to load keypair" });
        }

        const wallet = new NodeWallet(payer);
        const anchorWallet = wallet as anchor.Wallet;
        const provider = new anchor.AnchorProvider(connection, anchorWallet, { preflightCommitment: "confirmed" });
        anchor.setProvider(provider);
        const program = new anchor.Program<PumpNPass>(IDL, provider);

        const game = await findFinalizingGameByUserId(playerGames[0].userId);
        if(game.length === 0 || game.length > 1) {
            console.log("🚀 ~ finalization failes because game not found")
            return NextResponse.json({ status: 400, message: "Failed to find active game" });
        }
        if (!game || !game[0].deposit_per_player) {
            return NextResponse.json({ status: 400, message: "Game not found" });
        }
        const depositPerPlayer = parseFloat(game[0].deposit_per_player);

        const seedHex = game[0].seed;
        if(!seedHex){
            return NextResponse.json({ status: 400, message: "Seed not found" });
        }
        const seed = new anchor.BN(seedHex, 'hex'); // Convert from hex

        const [escrow] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("escrow"), 
                payer.publicKey.toBuffer(),
                seed.toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );
        const deposits = depositPerPlayer * playerGames.length;

        let totalpoints = 0;
        let ctrpoints = 0;
        for(const playerGame of playerGames){
            totalpoints += parseInt(playerGame.totalPoints);
        }

        for(const playerGame of playerGames){
            const share = calculateShare(parseInt(playerGame.totalPoints), totalpoints);
            const payout = share * deposits;
            ctrpoints += payout;
            if(ctrpoints > deposits){
                console.log("🚀 ~ finalization failes because ctrpoints > deposits")
            }
            await saveScoreOnChain(playerGame, payout, escrow.toString(), seedHex);
        }

    return NextResponse.json({ status: 200, message: "Distribution successful" });
  } catch (error) {
    console.error("Error distributing funds:", error);
    return NextResponse.json(
      { error: "Error distributing funds" },
      { status: 500 }
    );
  }
}
