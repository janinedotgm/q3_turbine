# Pump 'n' Pass - Turbine Capstone Project

## Overview

Welcome to **Pump 'n' Pass**, a game developed as the Turbine Capstone Project by [bjoerndotsol](https://x.com/bjoerndotsol) and [janinedotgm](https://x.com/janinedotgm). This game is designed to be played via Telegram, providing an engaging and interactive experience.

## User Journey

1. **Join the Telegram Group**: The user joins the designated Telegram group for the game.
2. **Wallet Creation**: Upon joining, a wallet is automatically created for the user, and the wallet address is sent in the chat.
3. **Fund the Wallet**: The user is prompted to fund their wallet.
4. **Game Invitation**: Once the wallet is funded, the user receives an invitation to join a game, including the required stake amount.
5. **Join the Game**: The user can join the game by clicking a button.
6. **Escrow Deposit**: When enough players have joined, the funds are deposited into an escrow (we hold the keys, but users can export them).
7. **Game Start**: The game starts once all players have deposited their funds.
8. **Gameplay**:
   - The first player's turn begins.
   - The player can click a button to "pump" and earn points.
   - There is a limit to how many times the item can be pumped before it explodes.
   - If the item explodes, the player loses all points gained in that round, and the next round starts.
   - If the item doesn't explode, the player can choose to either pass the item to the next player or pump again.
9. **Rounds**: The game consists of three rounds.
10. **Scoring and Payout**: After three rounds, points are calculated, and funds are distributed back to the players based on the points they earned.

## Project Structure

The project folder contains the following components:

1. **/pumpnpass**: Anchor implementation for handling the escrow and saving the player states.
2. **/pumpnpass_bot**: The front-end interface for the game, implemented as a Telegram bot.
3. **/pumpnpass-test-app**: A test application to test the pumpnpass program.

## Architectural Diagram

For a detailed view of the system architecture, please refer to the [architectural diagram](https://www.figma.com/board/z2UvMbEH2dUJdaMndKewYp/Pump-'n'-Pass?node-id=0-1&t=x72uyDdtDY78NBfA-1).
