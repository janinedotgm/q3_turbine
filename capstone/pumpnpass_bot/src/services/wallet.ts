import {
  Keypair,
  Connection,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { encrypt } from "./encryption";

const url = process.env.RPC_URL || "https://api.devnet.solana.com";

const connection = new Connection(url, "confirmed");

export const getKeypair = () => new Keypair();

export const encryptSecret = (uint8Array: Uint8Array) => {
  const { encrypted, iv, authTag } = encrypt(uint8Array);
  return { encrypted, iv, authTag };
};

export const getBalance = async (pubKey: string) => {
  const balance = await connection.getBalance(new PublicKey(pubKey));
  return balance / LAMPORTS_PER_SOL;
};
