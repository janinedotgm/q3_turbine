#!/bin/bash

echo "payer balance:"
solana balance --keypair ~/payer-keypair.json
echo "payer public key:"
solana-keygen pubkey ~/payer-keypair.json
echo ""

echo "player1 balance:"
solana balance --keypair ~/player1-keypair.json
echo "player1 public key:"
solana-keygen pubkey ~/player1-keypair.json
echo ""

echo "player2 balance:"
solana balance --keypair ~/player2-keypair.json
echo "player2 public key:"
solana-keygen pubkey ~/player2-keypair.json
echo ""

echo "player3 balance:"
solana balance --keypair ~/player3-keypair.json
echo "player3 public key:"
solana-keygen pubkey ~/player3-keypair.json
echo ""

echo "player4 balance:"
solana balance --keypair ~/player4-keypair.json
echo "player4 public key:"
solana-keygen pubkey ~/player4-keypair.json
echo ""

