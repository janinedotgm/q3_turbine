mod programs;

#[cfg(test)]
mod tests {
    use solana_client::rpc_client::RpcClient;
    use solana_program::{system_instruction::transfer, system_program};
    use solana_sdk::{message::Message, pubkey::Pubkey, signature::{self, read_keypair_file, Keypair, Signer}, transaction::Transaction};
    use bs58;
    use std::io::{self, BufRead};
    use std::str::FromStr;
    use crate::programs::wba_prereq::WbaPrereqProgram;

    const RPC_URL: &str = "https://api.devnet.solana.com";

    #[test]
    fn keygen(){
        let kp = Keypair::new();
        println!("You've generated a new Solana wallet: {}", kp.pubkey().to_string());
        println!("");
        println!("To save your wallet, copy and paste the following into a JSON file:");
        println!("{:?}", kp.to_bytes());
    }

    #[test]
    fn base58_to_wallet(){
        println!("Input your private key as a wallet file byte array:");
        let stdin = io::stdin();
        let base58 = stdin.lock().lines().next().unwrap().unwrap();
        println!("Your wallet file is:");
        let wallet = bs58::decode(base58).into_vec().unwrap();
        println!("{:?}", wallet);
    }

    #[test]
    fn wallet_to_base58(){
        println!("Input your private key as a wallet file byte array:");
        let stdin = io::stdin();
        let wallet = stdin.lock().lines().next().unwrap().unwrap().trim_start_matches('[').trim_end_matches(']').split(',') .map(|s| s.trim().parse::<u8>().unwrap()).collect::<Vec<u8>>();
        println!("Your private key is:");
        let base58 = bs58::encode(wallet).into_string();
        println!("{:?}", base58);
    }

    #[test]
    fn airdrop(){
        // Import keypair
        let keypair = read_keypair_file("wallets/wba-wallet.json").expect("Could't find wallet file");

        // Connect to Solana Devnet RPC Client
        let client = RpcClient::new(RPC_URL);

        // Claim 2 devnet SOL tokens (2 billion lamports)
        match client.request_airdrop(&keypair.pubkey(), 2_000_000_000u64){
            Ok(s) => {
                println!("Success! Check out your TX here:"); 
                println!("https://explorer.solana.com/tx/{}?cluster=devnet", s.to_string());
            },
            Err(e) => println!("Oops, something went wrong: {}", e.to_string())
        }
    }

    #[test]
    fn transfer_sol(){
        // Import keypair
        let keypair = read_keypair_file("wallets/dev-wallet.json").expect("Couldn't find wallet file");

        // Define WBA public key
        let to_pubkey = Pubkey::from_str("<Your Public Key>").unwrap();

        // Create connection to Solana devnet
        let rpc_client = RpcClient::new(RPC_URL);

        // Get balance of dev wallet
        let balance = rpc_client.get_balance(&keypair.pubkey()).expect("Failed to get balance");

        // Get recent blockhash
        let recent_blockhash = rpc_client.get_latest_blockhash().expect("Failed to get recent blockhash");

        // Create a test txn to calculate fees
        let message = Message::new_with_blockhash(&[transfer(&keypair.pubkey(), &to_pubkey, balance)], Some(&keypair.pubkey()), &recent_blockhash);

        // Calculate exact fee rate to transfer entire SOL amount out of acount minus fees
        let fee = rpc_client.get_fee_for_message(&message).expect("Failed to get fee for message");

        // Create transaction
        let txn = Transaction::new_signed_with_payer(&[transfer(&keypair.pubkey(), &to_pubkey, balance - fee)], Some(&keypair.pubkey()), &vec![&keypair], recent_blockhash);

        // Send transaction
        let signature = rpc_client.send_and_confirm_transaction(&txn).expect("Failed to send transaction");

        // Print transaction out
        println!("Success! Check out your TX here: https://explorer.solana.com/tx/{}/?cluster=devnet", signature);
    }

    #[test]
    fn enroll(){
        use crate::programs::wba_prereq::{WbaPrereqProgram, CompleteArgs};

        // Create Solana devnet connection
        let rpc_client = RpcClient::new(RPC_URL);

        // Define account
        let signer = read_keypair_file("wallets/wba-wallet.json").expect("Couldn't find wallet file");

        let prereq = WbaPrereqProgram::derive_program_address(&[b"prereq", signer.pubkey().to_bytes().as_ref()]);

        // Define ix data
        let args = CompleteArgs{
            github: b"janinedotgm".to_vec()
        };

        // Get recent blockhash
        let blockhash = rpc_client.get_latest_blockhash().expect("Failed to get recent blockhash");

        // Invoke complete function
        let txn = WbaPrereqProgram::complete(&[&signer.pubkey(), &prereq, &system_program::id()], &args, Some(&signer.pubkey()), &[&signer], blockhash);

        let signature = rpc_client.send_and_confirm_transaction(&txn).expect("Failed to send transaction");

        println!("Success! Check out your TX here: https://explorer.solana.com/tx/{}/?cluster=devnet", signature);
    }
}
