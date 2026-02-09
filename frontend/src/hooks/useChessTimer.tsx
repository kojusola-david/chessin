import { useState, useEffect, useRef } from 'react';

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

export function useChessTimer(gameState: GameState, onTimeout: () => void) {
  const [whiteDisplay, setWhiteDisplay] = useState(gameState.whiteTimeLeft);
  const [blackDisplay, setBlackDisplay] = useState(gameState.blackTimeLeft);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    updateTimers();

    if (gameState.isGameOver) return;

    intervalRef.current = window.setInterval(() => {
      const result = updateTimers();
      
      if (result.white <= 0 || result.black <= 0) {
        clearInterval(intervalRef.current!);
        onTimeout();
      }
    }, 100);

    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameState]);

  function updateTimers() {
    const now = Date.now();
    const diff = now - gameState.lastMoveTimestamp;

    let w = gameState.whiteTimeLeft;
    let b = gameState.blackTimeLeft;

    if (gameState.turn === 'w') {
      w = Math.max(0, gameState.whiteTimeLeft - diff);
    } else {
      b = Math.max(0, gameState.blackTimeLeft - diff);
    }

    setWhiteDisplay(w);
    setBlackDisplay(b);
    
    return { white: w, black: b };
  }

  return { 
    whiteDisplay: formatTime(whiteDisplay), 
    blackDisplay: formatTime(blackDisplay),
    whiteMs: whiteDisplay,
    blackMs: blackDisplay
  };
}

// Helper: Formats milliseconds to MM:SS or MM:SS.d
function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  // Optional: Show decimals if under 10 seconds (standard in chess apps)
  if (totalSeconds < 10 && ms > 0) {
      const dec = Math.floor((ms % 1000) / 100);
      return `0:0${seconds}.${dec}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}