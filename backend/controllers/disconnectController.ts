import { Socket, Server } from 'socket.io';
import { GameManager } from '../services/GameManager.js';

export const handleGameDisconnect = (socket: Socket, io: Server) => {
  const userId = socket.handshake.auth.userId;
  const gameManager = GameManager.getInstance();
  const result = gameManager.getSessionByUserId(userId);

  if (result) {
    const { roomId, session } = result;

    // Notify the opponent
    io.to(roomId).emit('playerDisconnected', {
      message: 'Your opponent has disconnected.',
      socketId: socket.id,
    });

    // Strategy: Wait 60 seconds. If they don't reconnect, delete the game.
    setTimeout(() => {
      const currentSession = gameManager.getSession(roomId);
      // If the player is still missing from the room, clean up
      if (
        currentSession &&
        (currentSession.white?.id === userId ||
          currentSession.black?.id === userId)
      ) {
        // Check if they are actually gone (not reconnected with a new ID)
        // For a basic setup, we'll just remove the game to save memory
        gameManager.removeSession(roomId);
        console.log(`Game ${roomId} cleaned up due to inactivity.`);
      }
    }, 60000);
  }
};
