import { NextApiRequest, NextApiResponse } from 'next';
import {
    Connection,
    PublicKey,
    Keypair,
    SystemProgram,
} from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as anchor from "@coral-xyz/anchor"; 
import { IDL, PumpNPass } from '../../programs/pumpnpass'; 
import { readFileSync } from 'fs';
import { loadKeypair, readSeedFromFile, getPlayerKeypair } from '../../lib/accounts';

dotenv.config();

const PROGRAM_ID = new PublicKey('67zrcgrGfk4NGR6YTQNoqZhSxbhq87ZTPZFZvdQyJ3vz');
const connection = new Connection(process.env.RPC_URL ?? '');

const payer = loadKeypair(`/payer-keypair.json`);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { score, playerNumber } = req.body;
        console.log("🚀 ~ handler ~ playerNumber:", playerNumber)
        console.log("🚀 ~ handler ~ score:", score)

        if (!score || !playerNumber) {
            return res.status(400).json({ message: "Score and player number are required" });
        }

        try {
            const wallet = new anchor.Wallet(payer);
            const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "recent" });
            anchor.setProvider(provider);
            
            // Load the program with IDL and program ID
            const program = new anchor.Program<PumpNPass>(IDL, provider);

            const playerKeypair = getPlayerKeypair(playerNumber);
            const playerPublicKey = playerKeypair.publicKey;

            const seed = readSeedFromFile();

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

            console.log('Score saved successfully', tx);
            res.status(200).json({ message: "Score saved successfully", tx });

        } catch (error: any) {
            console.error("Error:", error);
            res.status(500).json({ message: "Error saving score", error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}