
import { readFileSync } from 'fs';
import {
    Keypair,
} from '@solana/web3.js';
import path from 'path';
import * as anchor from "@coral-xyz/anchor"; 



export const loadKeypair = () => {
   
    const payerKeypairBase64 = process.env.PAYER_KEYPAIR_BASE64;

    if (!payerKeypairBase64) {
        throw new Error("PAYER_KEYPAIR_BASE64 environment variable is not set");
    }
    
    try {
        // Step 2: Decode the Base64 string
        const payerKeypairJson = Buffer.from(payerKeypairBase64, 'base64').toString('utf-8');
    
        // Step 3: Parse the JSON
        const payerKeypairArray = JSON.parse(payerKeypairJson);
    
        // Step 4: Create the Keypair
        const payerKeypair = Keypair.fromSecretKey(new Uint8Array(payerKeypairArray));

        if(!payerKeypair) {
            throw new Error("Failed to decode and parse the keypair");
        }

        return payerKeypair;
    } catch (error) {
        console.error("Failed to decode and parse the keypair:", error);
    }
};

export const readSeedFromFile = (): anchor.BN => {
    const seedFilePath = path.resolve(process.env.HOME_DIR ?? '', 'seed.json');
    const seedData = JSON.parse(readFileSync(seedFilePath, 'utf8'));
    return new anchor.BN(seedData.seed);
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
