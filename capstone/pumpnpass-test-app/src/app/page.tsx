'use client';
import { useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
export default function Home() {
    const [result, setResult] = useState(null);
    const [gameInitialized, setGameInitialized] = useState(false);

    const handleLaunchGame = async () => {
        const response = await fetch('/api/initialize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        setResult(data);
        if (response.ok) {
            setGameInitialized(true);
        }
    };

    const handleDeposit = async (playerNumber: number) => {
        console.log("🚀 ~ handleDeposit ~ playerNumber:", playerNumber)
        const response = await fetch('/api/deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: 0.05 * LAMPORTS_PER_SOL,
                playerNumber: playerNumber,
            }),
        });

        const data = await response.json();
        setResult(data);
    };

    const handleSaveScore = async (playerNumber: number, score: number) => {
        console.log("🚀 ~ handleDeposit ~ playerNumber:", playerNumber)
        const response = await fetch('/api/save-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                score: score,
                playerNumber: playerNumber,
            }),
        });

        const data = await response.json();
        setResult(data);
    };

    const handleCheckDeposits = async () => {
        const response = await fetch('/api/check-deposits', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        const data = await response.json();
        console.log("🚀 ~ handleCheckDeposits ~ data:", data)
        setResult(data);
    }; 

    const handleFinalizeGame = async () => {
        const response = await fetch('/api/finalize-game', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        const data = await response.json();
        console.log("🚀 ~ handleFinalizeGame ~ data:", data)
        setResult(data);
    }; 

    const handleGetPlayerState = async (playerNumber: number) => {
        const response = await fetch('/api/get-player-state', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playerNumber: playerNumber,
            }),
        });
    
        const data = await response.json();
        console.log("🚀 ~ handleCheckDeposits ~ data:", data)
        setResult(data);
    }; 
    
    const handleDistributeFunds = async () => {
        const response = await fetch('/api/distribute-funds', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        const data = await response.json();
        setResult(data);
    }; 

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl text-center">
                {!gameInitialized && 
                <>
                    <h1 className="text-2xl font-bold mb-6">Game Launcher</h1>
                    <button
                        onClick={handleLaunchGame}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Launch Game
                    </button>
                </>}
                {gameInitialized && (
                    <div className="mt-6">
                        <h2 className="text-xl font-bold">Game Initialized</h2>
                        <p className="mb-4">Time to set your bet</p>
                        <button
                            onClick={() => handleDeposit(1)}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-2"
                        >
                            Player 1 Deposit
                        </button>
                        <button
                            onClick={() => handleDeposit(2)}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Player 2 Deposit
                        </button>
                        <button
                            onClick={handleCheckDeposits}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 my-4"
                        >
                            Check Deposits
                        </button>
                        <button
                            onClick={() => handleSaveScore(1, 3)}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-2"
                        >
                            Save Player 1 Score
                        </button>
                        <button
                            onClick={() => handleSaveScore(2, 7)}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Save Player 2 Score
                        </button>
                        <button
                            onClick={() => handleGetPlayerState(1)}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 my-2"
                        >
                            Get Player 1 State
                        </button>
                        <button
                            onClick={() => handleGetPlayerState(2)}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Get Player 2 State
                        </button>
                        <button
                            onClick={handleFinalizeGame}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 my-4"
                        >
                            Finalize Game
                        </button>
                        <button
                            onClick={handleDistributeFunds}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 my-4"
                        >
                            Distribute Funds
                        </button>
                    </div>
                )}
                {result && (
                    <div className="mt-6 text-start">
                        <h2 className="text-xl  font-bold">Result</h2>
                        <pre className="bg-gray-100 text-wrap break-words p-4 rounded mt-2">{JSON.stringify(result, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}