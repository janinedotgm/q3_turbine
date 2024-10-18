import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
    Connection,
    PublicKey,
    SystemProgram,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor"; 
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; 
import { randomBytes } from 'crypto';
import { updateGameSeed } from '../../../../src/db/queries/game';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { loadKeypair } from "@/src/utils/chainhelpers";
const connection = new Connection(process.env.RPC_URL ?? '');

export const maxDuration = 60;

// Save the seed to a file
const saveSeedToFile = (gameId: string, seed: anchor.BN) => {
    const seedHex = seed.toString('hex'); // Convert seed to hex
    updateGameSeed(gameId, seedHex); // Store as hex
};

export async function POST(request: NextRequest) {
  try {
    const {gameId, depositPerPlayer} = await request.json();
    const payer = loadKeypair();

    if(!payer) {
        return NextResponse.json({ status: 400, message: "Failed to load keypair" });
    }

    const wallet = new NodeWallet(payer);

    const anchorWallet = wallet as anchor.Wallet;
    
    const provider = new anchor.AnchorProvider(connection, anchorWallet, { preflightCommitment: "confirmed" });
    anchor.setProvider(provider);
    
    // Load the program with IDL and program ID
    const program = new anchor.Program<PumpNPass>(IDL, provider);

    const seed = new anchor.BN(randomBytes(8)); // TODO: Use gameId as seed      

    const [escrow] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("escrow"), 
            payer.publicKey.toBuffer(),
            seed.toArrayLike(Buffer, "le", 8)
        ],
        program.programId
    );
    
    const accounts = {
        payer: payer.publicKey,
        escrow,
        systemProgram: SystemProgram.programId,
    };
    
    const duration = new anchor.BN(3600);
    const amount = new anchor.BN(depositPerPlayer * LAMPORTS_PER_SOL);

    const tx = await program.methods
        .initialize(
            seed,
            duration, 
            amount,
        )
        .accounts(accounts)
        .signers([payer])
        .rpc();

    console.log("Transaction signature:", tx);

        // TODO: Webhook was to slow, find another solution
        // helius.createWebhook({
        //   accountAddresses: [escrow.toBase58()],
        //   transactionTypes: [TransactionType.ANY],
        //   webhookURL: `${baseUrl}/api/solana/webhook`,
        // });


    saveSeedToFile(gameId, seed);

    return NextResponse.json({ status: 200, message: "Escrow initialized" });
  } catch (error) {
    console.error("Error handling update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
