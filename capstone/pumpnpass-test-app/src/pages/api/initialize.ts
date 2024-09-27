import { NextApiRequest, NextApiResponse } from 'next';
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
import { IDL, PumpNPass } from '../../programs/pumpnpass'; // Your program and IDL
import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';

dotenv.config();

const PROGRAM_ID = new PublicKey('67zrcgrGfk4NGR6YTQNoqZhSxbhq87ZTPZFZvdQyJ3vz');
const connection = new Connection(process.env.RPC_URL ?? '');

// Utility function to load a keypair from a file
const loadKeypair = (filePath: string) => {
    const resolvedPath = path.resolve(filePath);
    const secretKeyString = fs.readFileSync(resolvedPath, 'utf8'); 
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
};

// Load keypairs
const homeDir = process.env.HOME_DIR;

const payer = loadKeypair(`${homeDir}/payer-keypair.json`);

// Save the seed to a file
const saveSeedToFile = (seed: anchor.BN) => {
    const seedFilePath = path.resolve(homeDir ?? '', 'seed.json');
    writeFileSync(seedFilePath, JSON.stringify({ seed: seed.toString() }), 'utf8');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {

        try {
            const wallet = new anchor.Wallet(payer);
            const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "recent" });
            anchor.setProvider(provider);
            
            // Load the program with IDL and program ID
            const program = new anchor.Program<PumpNPass>(IDL, provider);


            const gameId = Date.now();
            // const seed = new anchor.BN(Date.now());
            const seed = new anchor.BN(randomBytes(8)); // TODO: make seed a combo of timestamp and nonce        
            
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

            saveSeedToFile(seed);

            // const confirmedTx = await anchor.getProvider().connection.getTransaction(tx);
            // const confirmation = await connection.confirmTransaction(
            //     {
            //         signature: tx,
            //         ...latestBlockHash,
            //     },
            //     'confirmed' // Commitment level
            // );

            // if (confirmedTx && confirmedTx.meta && confirmedTx.meta.err === null) {
            res.status(200).json({ message: "Initialization successful"});
            // } else {
            //     console.error("Initialization failed");
            // }
            
            
            
    
        } catch (error: any) {
            console.error("Error:", error);
            res.status(500).json({ message: "Error initializing game", error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
