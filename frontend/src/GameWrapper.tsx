import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useMemo } from 'react';
import RenderChessBoard from './components/RenderChessboard';

export default function GameWrapper() {
  const { roomId } = useParams(); // Grabs the ID from the URL path

  // Initialize socket ONLY when this component mounts
  const socket = useMemo(
    () =>
      io('http://localhost:3000', {
        query: { roomId }, // Pass roomId immediately during connection
      }),
    [roomId]
  );

  return <RenderChessBoard socket={socket} roomId={roomId!} />;
}
