const baseUrl = process.env.BASE_URL;

export const initializeGameOnChain = async (gameId: string, publicKeys: string[]) => {
    console.log("🚀 ~ initializeGameOnChain ~ gameId:", gameId);
    console.log("🚀 ~ initializeGameOnChain ~ publicKeys:", publicKeys);
    
    const response = await fetch(`${baseUrl}/api/solana/initialize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId, publicKeys }),   
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from server:", errorText);
        throw new Error(`Failed to initialize game on chain: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("🚀 ~ initializeGameOnChain ~ data:", data);
    return data;
};

export const saveScoreOnChain = async (player: any, score: number) => {
    const response = await fetch(`${baseUrl}/api/solana/save-score`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player, score }),   
    });

}   

export const distributeFunds = async (player: any) => {
    console.log("🚀 ~ distributeFunds for player:", player)
    const response = await fetch(`${baseUrl}/api/solana/distribute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player }),   
    });

}

export const finalizeGameOnChain = async (playerGames: any[], seedHex: string) => {
    console.log("🚀 ~ finalizeGameOnChain ~ playerGames:")
    const response = await fetch(`${baseUrl}/api/solana/finalize-game`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerGames, seedHex }),   
    });

    return response;
}