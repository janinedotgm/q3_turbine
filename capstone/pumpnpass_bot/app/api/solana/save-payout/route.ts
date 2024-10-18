import { NextRequest, NextResponse } from "next/server";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor"; 
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; 
import { loadKeypair, readSeedFromFile } from '../../../../src/utils/chainhelpers';
import { decrypt } from '../../../../src/services/encryption';
import { findUserById, findUserByTelegramId } from '../../../../src/db/queries/users';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { findActiveGameByUserId } from '../../../../src/db/queries/game';
import { startGame } from '../../../../src/gamelogic/initializeGame';

const PROGRAM_ID = new PublicKey('67zrcgrGfk4NGR6YTQNoqZhSxbhq87ZTPZFZvdQyJ3vz');
const connection = new Connection(process.env.RPC_URL ?? '', 'confirmed');

const payer = loadKeypair(`/payer-keypair.json`);

export async function POST(request: NextRequest) {
    try {
        const { escrow, payout, player, seedHex } = await request.json();
        console.log("🚀 ~ POST ~ player:", player)
        console.log("🚀 ~ POST ~ payout:", payout)
        console.log("🚀 ~ POST ~ escrow:", escrow)
        console.log("🚀 ~ POST ~ seed:", seedHex)
        const seed = new anchor.BN(seedHex, 'hex');
        const wallet = new NodeWallet(payer);

        const anchorWallet = wallet as anchor.Wallet;
        const provider = new anchor.AnchorProvider(connection, anchorWallet, { preflightCommitment: "finalized" });
        anchor.setProvider(provider);
        
        const program = new anchor.Program<PumpNPass>(IDL, provider);

        const user = await findUserById(player.userId);
        const playerPublicKey = new PublicKey(user.publicKey);

        // Ensure player.secretKey, player.iv, and player.authTag are hex-encoded
        const privateKey = decrypt(user.secretKey, user.iv, user.authTag);
        
        const playerKeypair = Keypair.fromSecretKey(privateKey);

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
            .finalize(seed, new anchor.BN(payout*LAMPORTS_PER_SOL))
            .accounts(accounts)
            .signers([playerKeypair, payer])
            .rpc();

        console.log('Score saved successfully', tx);
        
        return NextResponse.json({ status: 200, message: "Payout saved successfully" });
  } catch (error) {
    console.error("Error saving payout:", error);
    return NextResponse.json(
      { error: "Error saving payout" },
      { status: 500 }
    );
  }
}
