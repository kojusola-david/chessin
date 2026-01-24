import prisma from "./Prisma";

const player = await prisma.player.create({
    data: {
        username: "Player1",
        name: "Player",
        email: "player1@gmail.com",
        password_hash: '1',
        currentRapidRating: 1000,
        currentBlitzrating: 1000,
        currentBulletRating: 1000,
    }
})

console.log(player);
