import { NextRequest, NextResponse } from "next/server";
import * as anchor from "@coral-xyz/anchor"; 
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; 
import { loadKeypair, translateToJSON } from '../../../../src/utils/chainhelpers';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { findActiveGameByUserId } from '../../../../src/db/queries/game';

const connection = new Connection(process.env.RPC_URL ?? '', 'confirmed');

export async function POST(request: NextRequest) {
    try {
        const { player } = await request.json();
        if (!player) {
            return NextResponse.json({ status: 400, message: "Player is required" });
        }
        const payer = loadKeypair();

        if(!payer) {
            return NextResponse.json({ status: 400, message: "Failed to load keypair" });
        }

        const wallet = new NodeWallet(payer);
        const anchorWallet = wallet as anchor.Wallet;
        const provider = new anchor.AnchorProvider(connection, anchorWallet, { preflightCommitment: "confirmed" });
        anchor.setProvider(provider);
        const program = new anchor.Program<PumpNPass>(IDL, provider);

        const game = await findActiveGameByUserId(player.id);
        if(game.length === 0 || game.length > 1) {
            return NextResponse.json({ status: 400, message: "Failed to find active game" });
        }

        if (!game || !game[0].seed) {
            return NextResponse.json({ status: 400, message: "Game not found" });
        }

        const seedHex = game[0].seed;
        const seed = new anchor.BN(seedHex, 'hex'); // Convert from hex
        const [escrow] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("escrow"), 
                payer.publicKey.toBuffer(),
                seed.toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );

        const accountInfo = await connection.getAccountInfo(escrow);
        const data = accountInfo?.data;

        if (data) {
            const decodedData = program.coder.accounts.decode('escrow', data);
            const jsonData = translateToJSON(decodedData);

            const playerCount = jsonData.playerCount;
            const depositPerPlayer = jsonData.depositPerPlayer;
            const totalDeposits = playerCount * depositPerPlayer;

            const deposit = parseInt(jsonData.deposit);
            if(totalDeposits === deposit) {
                return NextResponse.json({ status: 200, message: 'Ready to start game', totalDeposits: deposit , expectedDeposit: totalDeposits});
            } else {
                return NextResponse.json({ status: 200, message: 'Waiting for deposits', totalDeposits: deposit , expectedDeposit: totalDeposits});
            }
        } else {
            return NextResponse.json({ status: 404, message: 'Account not found' });
        }

  } catch (error) {
    console.error("Error distributing funds:", error);
    return NextResponse.json(
      { error: "Error distributing funds" },
      { status: 500 }
    );
  }
}