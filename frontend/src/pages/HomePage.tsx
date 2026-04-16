import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { socket } from '../socket';
import Lobby from '../components/Lobby';

export default function HomePage() {
  const navigate = useNavigate();

  const handleCreateGame = (timeControl: string) => {
    const newRoomId = nanoid(8);
    navigate(`/game/${timeControl}/${newRoomId}`);
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
        onClick={() => handleCreateGame('RAPID')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        New rapid game
      </button>

      <button
        onClick={() => handleCreateGame('BLITZ')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        New blitz game
      </button>

      <button
        onClick={() => handleCreateGame('BULLET')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        New bullet game
      </button>
      <button onClick={handleLogOut}>Logout</button>

      <Lobby socket={socket}/>
    </div>
  );
}
