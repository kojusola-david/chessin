import { io, Socket } from 'socket.io-client';
import { nanoid } from 'nanoid';

// Get existing ID or create a new one
let userId = localStorage.getItem('chess_user_id');
if (!userId) {
  userId = nanoid();
  localStorage.setItem('chess_user_id', userId);
}

// Pass it during the handshake
export const socket: Socket = io('http://localhost:3000', {
  auth: { userId },
});
