import { Socket, Server } from 'socket.io';
import { GameManager } from '../services/GameManager.js';

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

export const handleJoinRoom = (socket: Socket, io: Server, roomId: string) => {
  const userId = socket.handshake.auth.userId;
  const gameManager = GameManager.getInstance();
  let session = gameManager.getSession(roomId);

  if (!session) {
    // If room is empty, this user becomes White
    session = gameManager.createSession(roomId, userId);
    socket.join(roomId);
    socket.emit('role', 'White');
  } else if (!session.blackId && userId !== session.whiteId) {
    // 2. Second player joins (Black)
    session = gameManager.joinGame(roomId, userId);
    socket.join(roomId);
    socket.emit('role', 'Black');

    // io.to(roomId).emit('gameStart', {
    //   fen: session?.game.fen(),
    //   whiteId: session?.whiteId,
    //   blackId: session?.blackId,
    // });

    io.to(roomId).emit('gameSync', {
      fen: session?.game.fen(),
      turn: session?.game.turn(),
      whiteId: session?.whiteId,
      blackId: session?.blackId,
      // playerRole: session?.whiteId === userId ? 'w' : 'b',
      history: session?.game.history(),
      isGameOver: session?.game.isGameOver(),
    });
  } else {
    // 3. Reconnection Logic
    // Check if this socket (or better, a persistent ID) matches a player already in the session
    const isWhite = userId === session.whiteId;
    const isBlack = userId === session.blackId;

    if (isWhite || isBlack) {
      socket.join(roomId);
      socket.emit('gameSync', {
        fen: session.game.fen(),
        turn: session.game.turn(),
        playerRole: isWhite ? 'w' : 'b',
        history: session.game.history(),
        isGameOver: session.game.isGameOver(),
        roomConfig: {
          whitePlayerId: session.whiteId,
          blackPlayerId: session.blackId,
        },
      });
    } else {
      socket.emit('error', 'Room is full'); // Handle spectators later
    }
  }

  console.log('Room Id: ', roomId);

  console.log({
    blackId: session?.blackId,
    whiteId: session?.whiteId,
  });
};
