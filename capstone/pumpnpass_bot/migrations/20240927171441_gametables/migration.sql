-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('Active', 'Completed');

-- CreateTable
CREATE TABLE "User" (
    "telegramId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "username" TEXT,
    "authTag" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "secretKey" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "startingValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL,
    "status" "RoundStatus" NOT NULL,
    "loserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
