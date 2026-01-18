import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';

export default function HomePage() {
  const navigate = useNavigate();

  const handleCreateGame = () => {
    const newRoomId = nanoid(8);
    navigate(`/game/${newRoomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">ChessIn</h1>
      <button
        onClick={handleCreateGame}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Create Private Match
      </button>
    </div>
  );
}
