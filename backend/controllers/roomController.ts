import { Socket, Server } from 'socket.io';
import MatchmakingService from '../services/MatchmakingService.js';
import prisma from '../services/Prisma.js';
import { TimeClass } from '../generated/enums.js';

const matchmakingService = MatchmakingService.getInstance();

export const handleJoinRoom = async (
  socket: Socket,
  io: Server,
  roomId: string,
  timeClass : TimeClass = 'RAPID'
) => {
  try {
     const userId = socket.data.userId;
  const player = await prisma.player.findUnique({
    where: {
      id: userId,
    },
  });

  if (!player) {
    throw new Error('One or both players could not be found in the database.');
  }
  const newSession = matchmakingService.acceptRequest(roomId, player);
  if(newSession){
    socket.join(roomId);
    socket.emit('role', 'b');
    io.emit('lobby_update', matchmakingService.getActiveRequests());
    io.to(roomId).emit('gameSync', newSession.gameState);
  } else {
      const newRequest = matchmakingService.createGameRequest(player, timeClass);
      socket.join(newRequest.roomId);
      socket.emit('role', 'w');
      io.emit('lobby_update', matchmakingService.getActiveRequests());
    }
  } catch (err) {
    socket.emit('error', {
      code: 'JOIN_ROOM_FAILED',
      message: err instanceof Error ? err.message : 'Something went wrong',
    });
  }
 
  }
