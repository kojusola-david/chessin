import { Chessboard } from 'react-chessboard';
import { Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';

interface props {
  socket: Socket;
  roomId: string;
}

export default function RenderChessBoard({ socket, roomId }: props) {
  // Keep the engine instance in a ref so it persists without triggering re-renders
  const game = useRef(new Chess());
  const [chessPosition, setChessPosition] = useState(game.current.fen());
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);

  function makeMove(moveObj: { from: string; to: string; promotion?: string }) {
    try {
      // Validate and apply move to the engine
      const result = game.current.move(moveObj);

      if (result) {
        setChessPosition(game.current.fen());
        return result;
      }
    } catch (e) {
      return null; // Handle illegal move errors from chess.js
    }
    return null;
  }

  function onDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    console.log(
      'Move attempted:',
      sourceSquare,
      targetSquare,
      `roomId${roomId}`
    ); // DEBUG LINE
    if (game.current.turn() !== playerColor) {
      console.warn("It's not your turn!");
      return false;
    }

    if (!targetSquare) return false;
    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    };

    const move = makeMove(moveData);

    if (move !== null) {
      console.log('Move legal, emitting...', move); // DEBUG LINE
      // Emitting to the backend
      socket.emit('makeMove', {
        move: moveData, // Best to wrap it in a 'move' key for clarity
        roomId: roomId, // Use the key your backend expects
      });
      return true;
    }
    return false;
  }

  useEffect(() => {
    // Listen for updates from the backend (opponent moves)
    socket.on('role', (color: string) => {
      console.log('Assigned role:', color);
      if (color === 'White') {
        setPlayerColor('w');
      } else if (color === 'Black') {
        setPlayerColor('b');
      }
    });

    socket.on('gameUpdate', (data) => {
      const { fen, isGameOver, isCheckmate } = data;

      game.current.load(fen);
      setChessPosition(game.current.fen());

      if (isCheckmate) {
        alert('Checkmate! Game Over.');
      } else if (isGameOver) {
        alert('The game ended in a draw.');
      }
    });

    return () => {
      socket.off('role');
      socket.off('gameUpdate');
    };
  }, [socket]); // Add socket to dependency array

  const chessboardOptions = {
    position: chessPosition,
    onPieceDrop: onDrop,
    boardOrientation: (playerColor === 'w' ? 'white' : 'black') as
      | 'white'
      | 'black',
    animationDuration: 200,
  };

  if (!playerColor) {
    return <div>Waiting for game to start and roles to be assigned...</div>;
  }
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Chessboard options={chessboardOptions} />
    </div>
  );
}
