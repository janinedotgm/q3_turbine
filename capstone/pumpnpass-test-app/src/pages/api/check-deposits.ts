import { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey, Connection } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import { IDL, PumpNPass } from '../../programs/pumpnpass';
import { loadKeypair, readSeedFromFile, translateToJSON } from '../../lib/accounts';
import { Buffer } from 'buffer';

const connection = new Connection(process.env.RPC_URL ?? '', 'confirmed');

const payer = loadKeypair(`/payer-keypair.json`);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const wallet = new anchor.Wallet(payer); 
        const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "recent" });
        anchor.setProvider(provider);

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

        const accountInfo = await connection.getAccountInfo(escrow);
        console.log("🚀 ~ handler ~ accountInfo:", accountInfo?.lamports);
        const data = accountInfo?.data;

        if (data) {
            const decodedData = program.coder.accounts.decode('escrow', data);
            const jsonData = translateToJSON(decodedData);
            console.log("🚀 ~ handler ~ decodedData:", jsonData);

            const playerCount = jsonData.playerCount;
            const depositPerPlayer = jsonData.depositPerPlayer;
            const totalDeposits = playerCount * depositPerPlayer;

            const deposit = parseInt(jsonData.deposit);

            if(totalDeposits === deposit) {
                res.status(200).json({ message: 'Ready to start game', totalDeposits: deposit , expectedDeposit: totalDeposits});
            } else {
                res.status(200).json({ message: 'Waiting for deposits', totalDeposits: deposit , expectedDeposit: totalDeposits});
            }
        } else {
            res.status(404).json({ message: 'Account not found' });
        }
    } else {
        // Handle any other HTTP method that isn't GET
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
