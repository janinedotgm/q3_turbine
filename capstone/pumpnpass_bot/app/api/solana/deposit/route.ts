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

export async function POST(request: NextRequest) {
    try {
        const { amount, telegramId } = await request.json();
        console.log("🚀 ~ POST ~ telegramId:", telegramId);
        console.log("🚀 ~ POST ~ amount:", amount);

        if (!amount || !telegramId) {
            return NextResponse.json({ status: 400, message: "Amount and telegram ID are required" });
        }
    
        const wallet = new NodeWallet(payer);

        const anchorWallet = wallet as anchor.Wallet;
        const provider = new anchor.AnchorProvider(connection, anchorWallet, { preflightCommitment: "confirmed" });
        anchor.setProvider(provider);
        
        const program = new anchor.Program<PumpNPass>(IDL, provider);

        const player = await findUserByTelegramId(telegramId);
        const playerPublicKey = new PublicKey(player.publicKey);

        // Ensure player.secretKey, player.iv, and player.authTag are hex-encoded
        const privateKey = decrypt(player.secretKey, player.iv, player.authTag);
        
        const playerKeypair = Keypair.fromSecretKey(privateKey);

        const game = await findActiveGameByUserId(player.id);

        if(game.length === 0 || game.length > 1) {
            return NextResponse.json({ status: 400, message: "Failed to find active game" });
        }

        if (!game || !game[0].seed) {
            return NextResponse.json({ status: 400, message: "Game not found" });
        }

        const seedHex = game[0].seed;
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

        const [playerAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("player"), playerPublicKey.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const accounts = {
            player: playerPublicKey,
            payer: payer.publicKey,
            escrow,
            playerAccount,
            systemProgram: SystemProgram.programId,
        };

        const lamports = amount*LAMPORTS_PER_SOL;
        let tx = await program.methods
            .deposit(seed, new anchor.BN(lamports))
            .accounts(accounts)
            .signers([playerKeypair, payer])
            .rpc();

        console.log('Deposit successful', tx);

        const balance = await connection.getBalance(escrow) / LAMPORTS_PER_SOL;
        console.log("🚀 ~ POST ~ balance:", balance)

        const depositPerPlayer = parseFloat(game[0].deposit_per_player);
        const expectedBalance = depositPerPlayer * game[0].players!.length;
        console.log("🚀 ~ POST ~ expectedBalance:", expectedBalance)

        if(balance >= expectedBalance) {
            console.log("Starting game -> notify players");
            await startGame(game[0].id);
            
        }

    return NextResponse.json({ status: 200, message: "Deposit successful" });
  } catch (error) {
    console.error("Error depositing funds:", error);
    return NextResponse.json(
      { error: "Error depositing funds" },
      { status: 500 }
    );
  }
}
