import { NextRequest, NextResponse } from "next/server";
import { Keypair, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor"; 
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; 
import { loadKeypair } from '../../../../src/utils/chainhelpers';
import { decrypt } from '../../../../src/services/encryption';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { findFinalizingGameByUserId } from '../../../../src/db/queries/game';

const connection = new Connection(process.env.RPC_URL ?? '', 'confirmed');


export async function POST(request: NextRequest) {
    try {
        const { player } = await request.json();

        if (!player) {
            return NextResponse.json({ status: 400, message: "Player is required" });
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

        const playerPublicKey = new PublicKey(player.publicKey);

        // Ensure player.secretKey, player.iv, and player.authTag are hex-encoded
        const privateKey = decrypt(player.secretKey, player.iv, player.authTag);
        
        const playerKeypair = Keypair.fromSecretKey(privateKey);

        const game = await findFinalizingGameByUserId(player.id);

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

        const [playerAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("player"), 
                playerPublicKey.toBuffer(), 
                seed.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const accounts = {
            player: playerPublicKey,
            payer: payer.publicKey,
            escrow,
            playerAccount,
            systemProgram: SystemProgram.programId,
        };

        await program.methods
            .distributefunds() 
            .signers([playerKeypair])
            .accounts(accounts)
            .rpc();

    return NextResponse.json({ status: 200, message: "Distribution successful" });
  } catch (error) {
    console.error("Error distributing funds:", error);
    return NextResponse.json(
      { error: "Error distributing funds" },
      { status: 500 }
    );
  }
}
