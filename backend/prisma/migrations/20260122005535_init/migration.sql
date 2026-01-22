-- CreateEnum
CREATE TYPE "TimeClass" AS ENUM ('BULLET', 'BLITZ', 'RAPID');

-- CreateEnum
CREATE TYPE "Termination" AS ENUM ('CHECKMATE', 'TIMEOUT', 'RESIGNATION', 'ABANDONMENT', 'AGREEMENT', 'INSUFFICIENT_MATERIAL', 'FIFTY_MOVE_RULE', 'REPETITION', 'STALEMATE');

-- CreateEnum
CREATE TYPE "Result" AS ENUM ('BLACK_WIN', 'WHITE_WIN', 'DRAW');

-- CreateTable
CREATE TABLE "Player" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "currentRapidRating" INTEGER NOT NULL,
    "currentBlitzrating" INTEGER NOT NULL,
    "currentBulletRating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" UUID NOT NULL,
    "roomId" TEXT NOT NULL,
    "rated" BOOLEAN NOT NULL,
    "timeControl" TEXT NOT NULL,
    "timeClass" "TimeClass" NOT NULL,
    "fen" TEXT NOT NULL,
    "pgn" TEXT NOT NULL,
    "whiteId" UUID NOT NULL,
    "blackId" UUID NOT NULL,
    "result" "Result",
    "termination" "Termination",

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingHistory" (
    "id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" UUID NOT NULL,
    "gameId" UUID,

    CONSTRAINT "RatingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_whiteId_fkey" FOREIGN KEY ("whiteId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_blackId_fkey" FOREIGN KEY ("blackId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingHistory" ADD CONSTRAINT "RatingHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingHistory" ADD CONSTRAINT "RatingHistory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
