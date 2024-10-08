import { NextRequest, NextResponse } from "next/server";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor"; 
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; 
import { loadKeypair, readSeedFromFile, translateToJSON } from '../../../../src/utils/chainhelpers';
import { decrypt } from '../../../../src/services/encryption';
import { findUserByTelegramId } from '../../../../src/db/queries/users';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { findActiveGameByUserId } from '../../../../src/db/queries/game';
import { startGame } from '../../../../src/gamelogic/initializeGame';

const PROGRAM_ID = new PublicKey('67zrcgrGfk4NGR6YTQNoqZhSxbhq87ZTPZFZvdQyJ3vz');
const connection = new Connection(process.env.RPC_URL ?? '', 'confirmed');

const payer = loadKeypair(`/payer-keypair.json`);

const calculateShare = (playerScore: number, totalScore: number) => {
    console.log("🚀 ~ calculateShare ~ totalScore:", totalScore);
    console.log("🚀 ~ calculateShare ~ playerScore:", playerScore);
    const payout = (playerScore / totalScore);
    const formattedPayout = payout.toFixed(2); // Format to 2 decimal places
    console.log("🚀 ~ calculateShare ~ payout:", formattedPayout);
    return parseFloat(formattedPayout); // Return as a number
}

export async function POST(request: NextRequest) {
    try {
        const { player } = await request.json();
        console.log("hi 1 =======================")
        if (!player) {
            return NextResponse.json({ status: 400, message: "Player is required" });
        }
        console.log("hi 2 =======================")
        const wallet = new NodeWallet(payer);
        console.log("hi 3 =======================")
        const anchorWallet = wallet as anchor.Wallet;
        const provider = new anchor.AnchorProvider(connection, anchorWallet, { preflightCommitment: "confirmed" });
        anchor.setProvider(provider);
        console.log("hi 4 =======================")
        const program = new anchor.Program<PumpNPass>(IDL, provider);
        console.log("hi 5 =======================")
        // const playerPublicKey = new PublicKey(player.publicKey);

        // Ensure player.secretKey, player.iv, and player.authTag are hex-encoded
        // const privateKey = decrypt(player.secretKey, player.iv, player.authTag);
        
        // const playerKeypair = Keypair.fromSecretKey(privateKey);

        const game = await findActiveGameByUserId(player.id);
        console.log("hi 6 =======================")
        if(game.length === 0 || game.length > 1) {
            return NextResponse.json({ status: 400, message: "Failed to find active game" });
        }
        console.log("hi 7 =======================")
        if (!game || !game[0].seed) {
            return NextResponse.json({ status: 400, message: "Game not found" });
        }
        console.log("hi 8 =======================")
        const seedHex = game[0].seed;
        const seed = new anchor.BN(seedHex, 'hex'); // Convert from hex
        console.log("hi 9 =======================")
        const [escrow] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("escrow"), 
                payer.publicKey.toBuffer(),
                seed.toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );

        const accountInfo = await connection.getAccountInfo(escrow);
        console.log("hi 10 =======================")
        console.log("🚀 ~ handler ~ accountInfo:", accountInfo?.lamports);
        const data = accountInfo?.data;

        if (data) {
            const decodedData = program.coder.accounts.decode('escrow', data);
            const jsonData = translateToJSON(decodedData);
            console.log("🚀 ~ handler ~ decodedData:", jsonData);

            const playerCount = jsonData.playerCount;
            const depositPerPlayer = jsonData.depositPerPlayer;
            const totalDeposits = playerCount * depositPerPlayer;

            const deposit = parseInt(jsonData.deposit);
            if(totalDeposits === deposit) {
                return NextResponse.json({ status: 200, message: 'Ready to start game', totalDeposits: deposit , expectedDeposit: totalDeposits});
            } else {
                return NextResponse.json({ status: 200, message: 'Waiting for deposits', totalDeposits: deposit , expectedDeposit: totalDeposits});
            }
        } else {
            return NextResponse.json({ status: 404, message: 'Account not found' });
        }

  } catch (error) {
    console.error("Error distributing funds:", error);
    return NextResponse.json(
      { error: "Error distributing funds" },
      { status: 500 }
    );
  }
}