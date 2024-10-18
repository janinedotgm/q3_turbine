const enum gameStatus {
    Open = "Open", // Game is open for players to join
    Pending = "Pending", // Game is pending to start
    Active = "Active", // Game is active
    Finalizing = "Finalizing", // Game is finalizing, calculating results & depositing funds
    Finished = "Finished", // Game is finished
}

export { gameStatus };