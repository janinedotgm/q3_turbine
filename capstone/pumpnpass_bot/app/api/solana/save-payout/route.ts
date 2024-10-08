import { NextRequest, NextResponse } from "next/server";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor"; 
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL, PumpNPass } from '../../../../src/programs/pumpnpass'; 
import { loadKeypair, readSeedFromFile } from '../../../../src/utils/chainhelpers';
import { decrypt } from '../../../../src/services/encryption';
import { findUserByTelegramId } from '../../../../src/db/queries/users';
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { findActiveGameByUserId } from '../../../../src/db/queries/game';
import { startGame } from '../../../../src/gamelogic/initializeGame';

const PROGRAM_ID = new PublicKey('67zrcgrGfk4NGR6YTQNoqZhSxbhq87ZTPZFZvdQyJ3vz');
const connection = new Connection(process.env.RPC_URL ?? '', 'confirmed');

const payer = loadKeypair(`/payer-keypair.json`);

export async function POST(request: NextRequest) {
    try {
        const { escrow, payout, player } = await request.json();
        console.log("🚀 ~ POST ~ player:", player)
        console.log("🚀 ~ POST ~ payout:", payout)
        console.log("🚀 ~ POST ~ escrow:", escrow)
        
        return NextResponse.json({ status: 200, message: "Payout saved successfully" });
  } catch (error) {
    console.error("Error saving payout:", error);
    return NextResponse.json(
      { error: "Error saving payout" },
      { status: 500 }
    );
  }
}
