import { NextRequest, NextResponse } from "next/server";
import {
    Connection,
    PublicKey,
    Keypair,
    SystemProgram,
} from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor"; 
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; 
import { loadKeypair } from '../../../../src/utils/chainhelpers';
import { findActiveGameByUserId } from '@/src/db/queries/game';
import { decrypt } from '../../../../src/services/encryption';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

const connection = new Connection(process.env.RPC_URL ?? '');
const payer = loadKeypair(`/payer-keypair.json`);
 

export async function POST(request: NextRequest) {

    const { score, player } = await request.json();

    if (!score || !player) {
        return NextResponse.json({ status: 400, message: "Score and player are required" });
    }

    try {
        const wallet = new NodeWallet(payer);
        const anchorWallet = wallet as anchor.Wallet;
        const provider = new anchor.AnchorProvider(connection, anchorWallet, { preflightCommitment: "finalized" });
        anchor.setProvider(provider);
        
        // Load the program with IDL and program ID
        const program = new anchor.Program<PumpNPass>(IDL, provider);

        const playerPublicKey = new PublicKey(player.publicKey);

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
        const seed = new anchor.BN(seedHex, 'hex');

        const [escrow] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("escrow"), 
                payer.publicKey.toBuffer(),
                seed.toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );

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

        let tx = await program.methods
            .savescore(seed, new anchor.BN(score))
            .accounts(accounts)
            .signers([playerKeypair, payer])
            .rpc();

        return NextResponse.json({ status: 200, message: "Deposit successful" });
  } catch (error) {
    console.error("Error depositing funds:", error);
    return NextResponse.json(
      { error: "Error depositing funds" },
      { status: 500 }
        );
    }
}