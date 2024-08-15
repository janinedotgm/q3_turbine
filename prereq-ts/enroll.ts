import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Program, Wallet, AnchorProvider } from "@coral-xyz/anchor";
import { IDL, WbaPrereq } from "./programs/wba_prereq";
import wallet from './wallets/wba-wallet.json';

// Import keypeir from wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create devnet connection
const connection = new Connection('https://api.devnet.solana.com');

// Github account
const github = Buffer.from('janinedotgm', 'utf-8');

// Create anchore provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {commitment: 'confirmed'});

// Create program
const program : Program<WbaPrereq> = new Program(IDL, provider);

// Create the PDA for our enrollment account
const enrollment_seeds = [Buffer.from("prereq"), keypair.publicKey.toBuffer()];
const [enrollment_key, _bump] = PublicKey.findProgramAddressSync(enrollment_seeds, program.programId);

// Execute enrollment txn
(async () => {
    try{
        const txhash = await program.methods.complete(github).accounts({signer: keypair.publicKey}).rpc();
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${txhash}?cluster=devnet`)
    }catch(e){
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
