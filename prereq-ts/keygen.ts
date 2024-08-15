import { Keypair } from "@solana/web3.js";

// Generate a new keypair
const kp = Keypair.generate();
console.log(`You've generated a new Solana wallet: ${kp.publicKey.toBase58()}`); // replace with [${kp.secretKey}] to print secret key
