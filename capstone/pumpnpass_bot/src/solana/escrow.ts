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
