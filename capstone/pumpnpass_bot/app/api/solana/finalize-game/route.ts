import { NextRequest, NextResponse } from "next/server";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor"; 
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; 
import { loadKeypair, readSeedFromFile } from '../../../../src/utils/chainhelpers';
import { decrypt } from '../../../../src/services/encryption';
import { findUserByTelegramId } from '../../../../src/db/queries/users';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { findActiveGameByUserId } from '../../../../src/db/queries/game';
import { startGame } from '../../../../src/gamelogic/initializeGame';

const PROGRAM_ID = new PublicKey('67zrcgrGfk4NGR6YTQNoqZhSxbhq87ZTPZFZvdQyJ3vz');
const connection = new Connection(process.env.RPC_URL ?? '', 'confirmed');

const payer = loadKeypair(`/payer-keypair.json`);

const baseUrl = process.env.BASE_URL;

const calculateShare = (playerScore: number, totalScore: number) => {
    if(totalScore === 0) return 0;
    console.log("🚀 ~ calculateShare ~ totalScore:", totalScore);
    console.log("🚀 ~ calculateShare ~ playerScore:", playerScore);
    const payout = (playerScore / totalScore);
    const formattedPayout = payout.toFixed(2); // Format to 2 decimal places
    console.log("🚀 ~ calculateShare ~ payout:", formattedPayout);
    return parseFloat(formattedPayout); // Return as a number
}

const saveScoreOnChain = async (player: any, payout: number, escrow: string) => {
    const response = await fetch(`${baseUrl}/api/solana/save-payout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player, payout, escrow }),   
    });

} 

export async function POST(request: NextRequest) {
    try {
        const { playerGames, seedHex } = await request.json();

        if (!playerGames) {
            return NextResponse.json({ status: 400, message: "Player games required" });
        }

        const wallet = new NodeWallet(payer);

        const anchorWallet = wallet as anchor.Wallet;
        const provider = new anchor.AnchorProvider(connection, anchorWallet, { preflightCommitment: "confirmed" });
        anchor.setProvider(provider);
        
        const program = new anchor.Program<PumpNPass>(IDL, provider);

        // const playerPublicKey = new PublicKey(player.publicKey);

        // Ensure player.secretKey, player.iv, and player.authTag are hex-encoded
        // const privateKey = decrypt(player.secretKey, player.iv, player.authTag);
        
        // const playerKeypair = Keypair.fromSecretKey(privateKey);


        // const game = await findActiveGameByUserId(gameId);

        // if(game.length === 0 || game.length > 1) {
        //     return NextResponse.json({ status: 400, message: "Failed to find active game" });
        // }

        // if (!game || !game[0].seed) {
        //     return NextResponse.json({ status: 400, message: "Game not found" });
        // }

        // const seedHex = game[0].seed;
        const seed = new anchor.BN(seedHex, 'hex'); // Convert from hex

        const [escrow] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("escrow"), 
                payer.publicKey.toBuffer(),
                seed.toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );

        console.log("🚀 ~ POST ~ escrow:", escrow)

        const deposits = await connection.getBalance(escrow);
        console.log("🚀 ~ POST ~ deposits:", deposits)

        let totalpoints = 0;
        for(const playerGame of playerGames){
            totalpoints += parseInt(playerGame.totalPoints);
        }

        for(const playerGame of playerGames){
            const share = calculateShare(parseInt(playerGame.totalPoints), totalpoints);
            console.log("🚀 ~ POST ~ share:", share)
            const payout = share * deposits;
            console.log("🚀 ~ POST ~ payout:", payout)
            await saveScoreOnChain(playerGame, payout, escrow.toString());
        }

        console.log("🚀 ~ POST ~ totalpoints:", totalpoints)




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
