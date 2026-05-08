import { Socket, Server } from 'socket.io';
import MatchmakingService from '../services/MatchmakingService.js';

export const handleGameDisconnect = (socket: Socket, io: Server) => {
  const userId = socket.handshake.auth.userId;
  const matchmakingService = MatchmakingService.getInstance();
  const result = matchmakingService.getSessionByUserId(userId);

  if (result) {
    const { roomId } = result;

    // Notify the opponent
    io.to(roomId).emit('playerDisconnected', {
      message: 'Your opponent has disconnected.',
      socketId: socket.id,
    });

    // Strategy: Wait 60 seconds. If they don't reconnect, delete the game.
    setTimeout(() => {
      const currentSession = matchmakingService.getSession(roomId);
      // If the player is still missing from the room, clean up
      if (
        currentSession &&
        (currentSession.white?.id === userId ||
          currentSession.black?.id === userId)
      ) {
        // Check if they are actually gone (not reconnected with a new ID)
        // For a basic setup, we'll just remove the game to save memory
        matchmakingService.removeSession(roomId);
        console.log(`Game ${roomId} cleaned up due to inactivity.`);
      }
    }, 60000);
  }
};
