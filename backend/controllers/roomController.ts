import { Socket, Server } from 'socket.io';
import { GameManager } from '../services/GameManager.js';

export const handleJoinRoom = (socket: Socket, io: Server, roomId: string) => {
    const gameManager = GameManager.getInstance();
    let session = gameManager.getSession(roomId);

    if (!session) {
        // If room is empty, this user becomes White
        session = gameManager.createSession(roomId, socket.id);
    } else {
        // If room has people, this user tries to become Black
        session = gameManager.joinGame(roomId, socket.id);
    }

    socket.join(roomId);
    console.log('Room Id: ', roomId);
    
    
    
    // Determine user role for logging or custom UI
    const role = socket.id === session?.whiteId ? 'White' : 
                 socket.id === session?.blackId ? 'Black' : 'Spectator';

    socket.emit('role', `You play as ${role}`); // Tell the frontend who they are
    io.to(roomId).emit('join', `Player ${socket.id} joined as ${role}`);
    console.log(session);
    

};