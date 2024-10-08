import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
// import { verifyHeliusSignature } from "../../../../src/utils/verifyHeliusSignature"; // Assume you have a utility to verify Helius signatures
// import { processEscrowEvent } from "../../../../src/handlers/escrowEventHandler"; // Assume you have a handler for processing escrow events

// Define the expected structure of the webhook payload
interface HeliusWebhookPayload {
  account: string;
  transactionType: string;
  data: any; // Adjust this type based on the actual structure of the data
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request signature (if Helius provides a way to do so)
    // const isValid = verifyHeliusSignature(request);
    // if (!isValid) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    // Parse the request body
    const payload: HeliusWebhookPayload = await request.json();

    // Log the received payload for debugging
    console.log("Received webhook payload:", payload);

    // Process the escrow event
    // await processEscrowEvent(payload);

    // Respond with a success message
    return NextResponse.json({ status: 200, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}