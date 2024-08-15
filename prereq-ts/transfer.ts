import { Transaction, SystemProgram, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js'
import wallet from './wallets/dev-wallet.json'

const from = Keypair.fromSecretKey(new Uint8Array(wallet));
const to = new PublicKey('<RECIVER_PUBLLIC_KEY>');

const connection = new Connection('https://api.devnet.solana.com');

(async () => {
    try {
        // Get balance of dev wallet
        const balance = await connection.getBalance(from.publicKey);
        console.log(`Balance: ${balance}`);

        // Create a test transactioin to calculate fees
        const testTransaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: balance
            })
        );

        testTransaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
        testTransaction.feePayer = from.publicKey;

        // Calculate exact fee rate to transfer entire SOL amount out out of account minus fees
        const fee = (await connection.getFeeForMessage(testTransaction.compileMessage(), 'confirmed')).value || 0;

        const balanceMinusFee = balance - fee;

        // Create the final txn with correct amount of lamports
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: balanceMinusFee
            })
        );

        // Sign txn, broadcast and confirm
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        );

        console.log(`Success Check out your TX here: 
        https://explorer.solana.com/tx/${signature}?cluster=devnet `);
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`);
    }
})();
