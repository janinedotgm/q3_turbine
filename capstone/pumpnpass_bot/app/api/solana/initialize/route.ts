import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
    Connection,
    PublicKey,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as anchor from "@coral-xyz/anchor"; // Corrected import
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; // Your program and IDL
import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import { updateGameSeed } from '../../../../src/db/queries/game';

export const runtime = "nodejs";

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
    console.log("🚀 ~ saveSeedToFile ~ seed:", seed)
    console.log("🚀 ~ saveSeedToFile ~ gameId:", gameId)
    updateGameSeed(gameId, seed);
};

export async function POST(request: NextRequest) {
  try {
    const {gameId, publicKeys} = await request.json();
    console.log("🚀 ~ POST ~ gameId:", gameId)
    console.log("🚀 ~ POST ~ publicKeys:", publicKeys)
    console.log('hi !!!!!!!!!!!!!!!!!!!!!!!')

    const wallet = new anchor.Wallet(payer);
    const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "recent" });
    anchor.setProvider(provider);
    
    // Load the program with IDL and program ID
    const program = new anchor.Program<PumpNPass>(IDL, provider);

    // const seed = new anchor.BN(Date.now());
    const seed = new anchor.BN(randomBytes(8)); // TODO: Use gameId as seed      
    
    // const nonce = randomBytes(4); // 4 bytes for nonce
    // const timestamp = Buffer.from(Date.now().toString()); // Convert timestamp to buffer
    // const seedBuffer = Buffer.concat([nonce, timestamp]); 
    // const seed = new anchor.BN(seedBuffer.toString('hex'), 16);

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
    const amount = new anchor.BN(0.05 * LAMPORTS_PER_SOL);
    // const latestBlockHash = await connection.getLatestBlockhash();

    let tx = await program.methods
        .initialize(
            seed,
            duration, 
            amount,
        )
        .accounts(accounts)
        .signers([payer])
        .rpc();

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
