/*
  Warnings:

  - You are about to drop the `RatingHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RatingHistory" DROP CONSTRAINT "RatingHistory_gameId_fkey";

-- DropForeignKey
ALTER TABLE "RatingHistory" DROP CONSTRAINT "RatingHistory_playerId_fkey";

-- DropTable
DROP TABLE "RatingHistory";
