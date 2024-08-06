import wallet from "./wallet/wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import bs58 from "bs58";

// Define our Mint address
const mint = publicKey("GFSbJMj5gFgpHEsgH5R5KYp5hQwBUZc1PhNtzBCF51FP")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint,
            mintAuthority: signer,
        }

        let data: DataV2Args = {
            name: 'solana_summer',
            symbol: 'SOSU',
            sellerFeeBasisPoints: 1,
            uri: "https://blush-electoral-rat-578.mypinata.cloud/ipfs/QmXLAnFtnmtzTgm6FTpUks8qBCQH4Bgcm1nYj4gcqmFhhf",
            creators: null,
            collection: null,
            uses: null
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data,
            isMutable: true,
            collectionDetails: null
        }

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        let result = await tx.sendAndConfirm(umi);
        
        console.log(bs58.encode(result.signature));
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
