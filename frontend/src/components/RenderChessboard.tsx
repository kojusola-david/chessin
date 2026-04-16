import { Chessboard } from 'react-chessboard';
import { Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { useNavigate } from 'react-router-dom';
import { useChessTimer } from '../hooks/useChessTimer';

interface props {
  socket: Socket;
  roomId: string;
  timeClass: string
}

interface GameState {
    turn: 'w' | 'b'
    fen: string
    pgn: string
    isCheckmate: boolean
    isGameOver: boolean
    blackTimeLeft: number
    whiteTimeLeft: number
    lastMoveTimestamp: number
}

export default function RenderChessBoard({ socket, roomId, timeClass }: props) {
  // Keep the engine instance in a ref so it persists without triggering re-renders
  const game = useRef(new Chess());
  const [chessPosition, setChessPosition] = useState(game.current.fen());
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  let startTime
  switch(timeClass){
    case 'RAPID':
      startTime = 600000
      break;
    case 'BLITZ':
      startTime = 300000
      break;
    case 'BULLET':
      startTime = 60000
      break;
  }

  const { whiteDisplay, blackDisplay } = useChessTimer(
        gameState || { 
            turn: 'w', 
            fen: '',
            pgn: '',
            isCheckmate: false,
            whiteTimeLeft: startTime!, 
            blackTimeLeft: startTime!, 
            lastMoveTimestamp: Date.now(),
            isGameOver: false 
        }, 
        () => {
            console.log("Flag fall!");
            socket.emit('claim_timeout', { roomId: roomId });
        }
    );
  
  const navigate = useNavigate();

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
        move: moveData,
        roomId: roomId,
      });
      return true;
    }
    return false;
  }

  function handleResign() {
    socket.emit('resign', {
      roomId: roomId,
    });
  }

  useEffect(() => {
    // Listen for updates from the backend (opponent moves)
    socket.on('role', (color: string) => {
      console.log('Assigned role:', color);
      setPlayerColor(color as 'w' | 'b');
    });

    socket.on('gameUpdate', (payload) => {
      game.current.load(payload.fen);
      setChessPosition(game.current.fen());
      setGameState(payload)
    });

    socket.on('gameSync', (payload) => {
      // Re-sync engine and UI
      game.current.load(payload.fen ? payload.fen: null);
      setChessPosition(game.current.fen());
    });

    socket.on('gameOver', (game) => {
      let message;
      switch (game.result) {
        case 'WHITE_WIN':
          message = `White wins by ${game.termination}`;
          break;
        case 'BLACK_WIN':
          message = `Black wins by ${game.termination}`;
          break;
        case 'DRAW':
          message = `Draw by ${game.termination}`;
          break;
      }

      alert(message);
      navigate('/');
    });

    return () => {
      socket.off('role');
      socket.off('gameUpdate');
      socket.off('gameSync');
      socket.off('gameOver');
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
      <div className="timer-black">{playerColor === 'b' ? whiteDisplay : blackDisplay}</div>
      <Chessboard options={chessboardOptions} />
      <div className="timer-white">{playerColor === 'w' ? whiteDisplay : blackDisplay}</div>
      <button onClick={handleResign}>Resign</button>
    </div>
  );
}
