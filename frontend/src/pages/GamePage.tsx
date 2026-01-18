import { useParams } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import { useMemo } from 'react';
import RenderChessBoard from '../components/RenderChessboard';
import { socket } from '../socket';

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();

  // Ensure socket is only created once per roomId
  socket.emit('joinRoom', roomId);

  return (
    <div className="game-layout">
      <h2>Room ID: {roomId}</h2>
      <RenderChessBoard socket={socket} roomId={roomId!} />
    </div>
  );
}
