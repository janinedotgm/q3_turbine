import { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey, Connection } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import { IDL, PumpNPass } from '../../programs/pumpnpass';
import { loadKeypair, readSeedFromFile, getPlayerKeypair, translateToJSON } from '../../lib/accounts';
import { Buffer } from 'buffer';


const connection = new Connection(process.env.RPC_URL ?? '');

const payer = loadKeypair(`/payer-keypair.json`);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { playerNumber } = req.body;
        console.log("🚀 ~ handler ~ playerNumber:", playerNumber)
        
        const wallet = new anchor.Wallet(payer); 
        const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "recent" });
        anchor.setProvider(provider);

        const program = new anchor.Program<PumpNPass>(IDL, provider);
       
        const playerKeypair = getPlayerKeypair(playerNumber);
        const playerPublicKey = playerKeypair.publicKey;

        const seed = readSeedFromFile();

        const [playerAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("player"), playerPublicKey.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const accountInfo = await connection.getAccountInfo(playerAccount);
        const data = accountInfo?.data;

        if (data) {
            const decodedData = program.coder.accounts.decode('player', data);
            const jsonData = translateToJSON(decodedData);
            console.log("🚀 ~ handler ~ decodedData:", jsonData);

            // const playerCount = jsonData.playerCount;
            // const depositPerPlayer = jsonData.depositPerPlayer;
            // const totalDeposits = playerCount * depositPerPlayer;

            // const deposit = parseInt(jsonData.deposit);

            // if(totalDeposits === deposit) {
                res.status(200).json({ message: jsonData });
            // } else {
            //     res.status(200).json({ message: 'Waiting for deposits' });
            // }
        } else {
            res.status(404).json({ message: 'Account not found' });
        }
    } else {
        // Handle any other HTTP method that isn't GET
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
