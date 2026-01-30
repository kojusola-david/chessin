import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { socket } from '../socket';

export default function HomePage() {
  const navigate = useNavigate();

  const handleCreateGame = () => {
    const newRoomId = nanoid(8);
    navigate(`/game/${newRoomId}`);
  };

  const handleLogOut = async () => {
    try {
      const response = await fetch('http://localhost:3000/logout', {
        method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        socket.disconnect();
        navigate('/login');
      } else {
        alert('Not completed');
      }
    } catch (err) {
      console.error('Network error during logout:', err);
    }
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
      <button onClick={handleLogOut}>Logout</button>
    </div>
  );
}
