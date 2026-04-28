import { Socket, Server } from 'socket.io';
import { GameManager } from '../services/GameManager.js';
import prisma from '../services/Prisma.js';
import { error } from 'node:console';
import { TimeClass } from '../generated/enums.js';
import LobbyManager from '../services/LobbyManager.js';

interface GameSyncPayload {
  fen: string; // Current board position
  turn: 'w' | 'b'; // Whose turn it is
  playerRole: 'w' | 'b'; // The role assigned to the rejoining socket
  history: string[]; // Array of moves made so far (e.g., ["e4", "e5", "Nf3"])
  isGameOver: boolean; // Whether the match is still active
  roomConfig: {
    whitePlayerId: string;
    blackPlayerId: string;
  };
}

export const handleJoinRoom = async (
  socket: Socket,
  io: Server,
  roomId: string,
  timeClass : TimeClass = 'RAPID'
) => {
  const userId = socket.data.userId;
  const player = await prisma.player.findUnique({
    where: {
      id: userId,
    },
  });

  if (!player) {
    throw new Error('One or both players could not be found in the database.');
  }
  const gameManager = GameManager.getInstance();
  const lobbyManager = LobbyManager.getInstance()
  let session = gameManager.getSession(roomId);
  let waiting = gameManager.getWaiting(roomId)

  if (!waiting?.player && !(session?.white && session?.black)) {
    // If room is empty, this user becomes White
    gameManager.createWaiting(roomId, player, timeClass);
    socket.join(roomId);
    socket.emit('role', 'w');
    io.emit('lobby_update', lobbyManager.getLobby())
  } else if (waiting?.player && (waiting?.player.id !== player.id)) {
    // 2. Second player joins (Black)
    session = gameManager.createSession(roomId, player);
    socket.join(roomId);
    socket.emit('role', 'b');

    if (!session?.Chessgame) {
      throw error('Game not found');
    }

    socket.emit('gameSync', {
    turn: 'w',
    fen: '',
    pgn: '',
    isCheckmate: false,
    isGameOver: false,
    blackTimeLeft: session.Chessgame.blackTime,
    whiteTimeLeft: session.Chessgame.whiteTime,
    lastMoveTimestamp: session.Chessgame.lastMoveTimestamp,
});
  } else if (session?.white && session?.black) {
    // 3. Reconnection Logic
    // Check if this socket (or better, a persistent ID) matches a player already in the session
    const isWhite = player.id === session.white.id;
    const isBlack = player.id === session.black.id;

    // if(!session?.Chessgame) {
    //   throw error('Game not found')
    // }
    if (isWhite || isBlack) {
      socket.join(roomId);
      socket.emit('gameSync', {
        fen: session!.Chessgame!.game.fen(),
        turn: session!.Chessgame!.game.turn(),
        playerRole: isWhite ? 'w' : 'b',
        history: session!.Chessgame!.game.history(),
        isGameOver: session!.Chessgame!.game.isGameOver(),
        roomConfig: {
          whitePlayerId: session!.white!.id,
          blackPlayerId: session!.black!.id,
        },
      });
    } else {
      socket.emit('error', 'Room is full'); // Handle spectators later
    }
  }
};
