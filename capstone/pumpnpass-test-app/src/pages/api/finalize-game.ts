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
const connection = new Connection(process.env.RPC_URL ?? '', 'confirmed');

const payer = loadKeypair(`/payer-keypair.json`);

const calculateShare = (playerScore: number, totalScore: number) => {
    console.log("🚀 ~ calculateShare ~ totalScore:", totalScore);
    console.log("🚀 ~ calculateShare ~ playerScore:", playerScore);
    const payout = (playerScore / totalScore);
    const formattedPayout = payout.toFixed(2); // Format to 2 decimal places
    console.log("🚀 ~ calculateShare ~ payout:", formattedPayout);
    return parseFloat(formattedPayout); // Return as a number
}

const getPlayerState = async (playerNumber: number, host: string) => {
    const playerStateResponse = await fetch(`http://${host}/api/get-player-state`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerNumber }),
    });

    const playerState = await playerStateResponse.json();
    return playerState;
    
    // const share = calculateShare(playerState., totalScore);
    
}

const savePayout = async (payout: number, playerNumber: number, host: string) => {
    const result = await fetch(`http://${host}/api/save-payout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payout, playerNumber }),
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const host = req.headers.host;

            const result = await fetch(`http://${host}/api/check-deposits`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const deposits = await result.json();

            const player1State = (await getPlayerState(1, host ?? '')).message;
            const player2State = (await getPlayerState(2, host ?? '')).message;

            const totalScore = parseInt(player1State.score) + parseInt(player2State.score);

            const player1Share = calculateShare(parseInt(player1State.score), totalScore);
            const player2Share = calculateShare(parseInt(player2State.score), totalScore);

            const player1Payout = deposits.expectedDeposit * player1Share;
            const player2Payout = deposits.expectedDeposit * player2Share;

            console.log("🚀 ~ handler ~ player1Payout:", player1Payout)
            console.log("🚀 ~ handler ~ player2Payout:", player2Payout)

            await savePayout(player1Payout, 1, host ?? '');
            await savePayout(player2Payout, 2, host ?? '');
        
            res.status(200).json({ message: "Payout calculated and saved successfully"});

        } catch (error: any) {
            console.error("Error:", error);
            res.status(500).json({ message: "Error calculating payout", error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}