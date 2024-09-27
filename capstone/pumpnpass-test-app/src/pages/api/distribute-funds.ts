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

const transferPlayerFunds = async (player: Keypair) => {
    const wallet = new anchor.Wallet(payer);
    const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "recent" });
    anchor.setProvider(provider);
            
    // Load the program with IDL and program ID
    const program = new anchor.Program<PumpNPass>(IDL, provider);

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
        [
            Buffer.from("player"), 
            player.publicKey.toBuffer(), 
            seed.toArrayLike(Buffer, "le", 8)],
        program.programId
    );

    const accounts = {
        player: player.publicKey,
        payer: payer.publicKey,
        escrow,
        playerAccount,
        systemProgram: SystemProgram.programId,
    };

    let tx = await program.methods
        .distributefunds() 
        .signers([player])
        .accounts(accounts)
        .rpc();

    return tx;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const player1Keypair = getPlayerKeypair(1);
            const player2Keypair = getPlayerKeypair(2);

            await transferPlayerFunds(player1Keypair);
            await transferPlayerFunds(player2Keypair);

            console.log('Funds distributed successfully');
            res.status(200).json({ message: "Funds distributed successfully" });

        } catch (error: any) {
            console.error("Error:", error);
            res.status(500).json({ message: "Error distributing funds", error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}