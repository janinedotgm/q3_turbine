import wallet from "./wallet/wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        const image = "https://arweave.net/S2-pNEDddoMzDBNXM58kkGgxxHRoypCU__MJn743Z-E"
        const metadata = {
            name: "NEFT",
            symbol: "NEFT",
            description: "A generug",
            image,
            attributes: [
                {trait_type: 'background', value: 'abstract'}
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: image
                    },
                ]
            },
            creators: []
        };
        const myUri = await umi.uploader.uploadJson(metadata);

        console.log("Metadatae: ", metadata);
        console.log("Your image URI: ", myUri);

    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
