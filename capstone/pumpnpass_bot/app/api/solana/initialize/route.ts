import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
    Connection,
    PublicKey,
    Keypair,
    SystemProgram,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import * as anchor from "@coral-xyz/anchor"; 
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; 
import { randomBytes } from 'crypto';
import { updateGameSeed } from '../../../../src/db/queries/game';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { TransactionType, Helius } from 'helius-sdk';

const helius = new Helius(process.env.HELIUS_API_KEY ?? '');
const baseUrl = 'https://49f5-24-40-157-2.ngrok-free.app'; //process.env.BASE_URL;

// export const runtime = "nodejs";

const PROGRAM_ID = new PublicKey('67zrcgrGfk4NGR6YTQNoqZhSxbhq87ZTPZFZvdQyJ3vz');
const connection = new Connection(process.env.RPC_URL ?? '');

const loadKeypair = (filePath: string) => {
    const resolvedPath = path.resolve(filePath);
    const secretKeyString = fs.readFileSync(resolvedPath, 'utf8'); 
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
};

const homeDir = process.env.HOME_DIR;

const payer = loadKeypair(`${homeDir}/payer-keypair.json`);

// Save the seed to a file
const saveSeedToFile = (gameId: string, seed: anchor.BN) => {
    const seedHex = seed.toString('hex'); // Convert seed to hex
    console.log("🚀 ~ saveSeedToFile ~ seedHex:", seedHex);
    console.log("🚀 ~ saveSeedToFile ~ gameId:", gameId);
    updateGameSeed(gameId, seedHex); // Store as hex
};

export async function POST(request: NextRequest) {
  try {
    const {gameId, depositPerPlayer} = await request.json();

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

    let tx = await program.methods
        .initialize(
            seed,
            duration, 
            amount,
        )
        .accounts(accounts)
        .signers([payer])
        .rpc();

        // TODO: Webhook was to slow, find another solution
        // helius.createWebhook({
        //   accountAddresses: [escrow.toBase58()],
        //   transactionTypes: [TransactionType.ANY],
        //   webhookURL: `${baseUrl}/api/solana/webhook`,
        // });

    
    console.log("🚀 ~ handler ~ tx:", tx)

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
