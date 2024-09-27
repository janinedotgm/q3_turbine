
import { readFileSync } from 'fs';
import {
    Keypair,
} from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import * as anchor from "@coral-xyz/anchor"; 



export const loadKeypair = (filePath: string) => {
    const resolvedPath = path.resolve(`${process.env.HOME_DIR}/${filePath}`);
    const secretKeyString = fs.readFileSync(resolvedPath, 'utf8'); 
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
};

export const readSeedFromFile = (): anchor.BN => {
    const seedFilePath = path.resolve(process.env.HOME_DIR ?? '', 'seed.json');
    const seedData = JSON.parse(readFileSync(seedFilePath, 'utf8'));
    return new anchor.BN(seedData.seed);
};



export const getPlayerKeypair = (playerNumber: number) => {

    const player1 = loadKeypair(`/player1-keypair.json`);
    const player2 = loadKeypair(`/player2-keypair.json`);
    const player3 = loadKeypair(`/player3-keypair.json`);
    const player4 = loadKeypair(`/player4-keypair.json`);

    switch (playerNumber) {
        case 1: return player1;
        case 2: return player2;
        case 3: return player3;
        case 4: return player4;
        default: throw new Error('Invalid player number');
    }
};

export function translateToJSON(data: any): any {
    const result: any = {};

    for (const key in data) {
        if (data[key] instanceof anchor.BN) {
            result[key] = data[key].toString();
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            result[key] = translateToJSON(data[key]);
        } else {
            result[key] = data[key];
        }
    }

    return result;
}
