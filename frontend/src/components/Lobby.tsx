import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

interface Props{
    socket: Socket
}

type Player = {
    name: string | null;
    id: string;
    username: string;
    password_hash: string;
    email: string;
    currentRapidRating: number;
    currentBlitzrating: number;
    currentBulletRating: number;
    createdAt: Date;
}

interface payload {
  player: Player;
  timeClass: string
}

// Define the shape of the payload: An array of [string, Player] tuples
type GameTuple = [string, payload];

export default function Lobby({ socket }: Props) {
    // State holds the array of tuples
    const [games, setGames] = useState<GameTuple[]>([]);
    const navigate = useNavigate()

    useEffect(() => {
        // Define the listener
        const handleUpdate = (payload: GameTuple[]) => {
            console.log("Lobby updated:", payload);
            setGames(payload);
        };

        // Attach listener
        socket.on('lobby_update', handleUpdate);

        // CLEANUP: Important to prevent duplicates!
        return () => {
            socket.off('lobby_update', handleUpdate);
        };
    }, [socket]); // Only re-run if socket instance changes

    return (
        <div className="lobby-container">
            <h2>Open Lobbies</h2>
            
            {games.length === 0 ? (
                <p>No active games found.</p>
            ) : (
                games.map(([roomId, payload]) => (
                    // KEY CHANGE: Destructure the tuple here ^
                    // roomId is index 0, player is index 1
                    
                    <div key={roomId} className="game-card">
                        <div className="room-info">
                            <strong>Room ID:</strong> {roomId}
                        </div>
                        <div className="player-info">
                            <strong>Host:</strong> {payload.player.username} 
                            {/* Access properties of the player object here */}
                        </div>
                        
                        <button onClick={() => navigate(`/game/${payload.timeClass}/${roomId}`)}>
                            Join Game
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}