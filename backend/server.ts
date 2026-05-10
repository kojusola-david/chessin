import Fastify from 'fastify';
import { Server } from 'socket.io';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type, Static } from '@sinclair/typebox';
import { handleMove } from './controllers/moveController.js';
import { handleJoinRoom } from './controllers/roomController.js';
import { handleGameDisconnect } from './controllers/disconnectController.js';
import { handleLogin, handleLogout } from './controllers/logController';
import handleSignUp from './controllers/signUpController';
import jwt from 'jsonwebtoken';
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import cookie from 'cookie';
import prisma from './services/Prisma';
import 'dotenv/config';
import { PresenceService } from './services/PresenceService';
import GameEndService from './services/GameEndService.js';
import GameSessionService from './services/GameSessionService.js';
// --- Schemas ---
const MessageSchema = Type.Object({
  sender: Type.String(),
  message: Type.String({ minLength: 1, maxLength: 500 }),
  timestamp: Type.Optional(Type.Number()),
});

// --- Infer Typescript type from schemas ---
type Message = Static<typeof MessageSchema>;

//TODO: Message is unused. To be removed

const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

await fastify.register(cors, {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

await fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
});

fastify.get(
  '/',
  {
    schema: {
      response: {
        200: Type.Object({ status: Type.String() }),
      },
    },
  },
  async () => {
    return { status: 'ok' };
  }
);

fastify.get('/auth/me', async (req, res) => {
  const token = req.cookies.chessin_sid;

  if (!token) return res.status(401).send({ message: 'Not logged in' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Fetch fresh user data from Prisma if you want, or just return decoded info
    const user = await prisma.player.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, currentRapidRating: true },
    });

    return res.send(user);
  } catch (err) {
    return res.status(401).send({ message: 'Invalid session' });
  }
});

fastify.post('/login', handleLogin);
fastify.post('/register', handleSignUp);
fastify.post('/logout', handleLogout);

const start = async () => {
  try {
    await fastify.ready();

    const io = new Server(fastify.server, {
      cors: {
        origin: 'http://localhost:5173',
        credentials: true,
      },
    });
    io.use((socket, next) => {
      // 1. Parse the cookie header from the handshake
      const header = socket.handshake.headers.cookie;

      if (!header) {
        return next(new Error('No cookie found. Please log in.'));
      }

      const cookies = cookie.parse(header);
      const token = cookies.chessin_sid; // The name you used in res.cookie()

      if (!token) {
        return next(new Error('Authentication token missing.'));
      }

      try {
        // 2. Verify the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // 3. Attach the REAL identity to the socket
        socket.data.userId = decoded.userId;
        socket.data.username = decoded.username;

        next();
      } catch (err) {
        next(new Error('Invalid session. Please log in again.'));
      }
    });
    io.use((socket, next) => {
      // 1. Parse the cookie header from the handshake
      const header = socket.handshake.headers.cookie;

      if (!header) {
        return next(new Error('No cookie found. Please log in.'));
      }

      const cookies = cookie.parse(header);
      const token = cookies.chessin_sid; // The name you used in res.cookie()

      if (!token) {
        return next(new Error('Authentication token missing.'));
      }

      try {
        // 2. Verify the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // 3. Attach the REAL identity to the socket
        socket.data.userId = decoded.userId;
        socket.data.username = decoded.username;

        next();
      } catch (err) {
        next(new Error('Invalid session. Please log in again.'));
      }
    });
    io.on('connection', (socket) => {
      console.log(
        `User ${socket.data.username} joined with ID: ${socket.data.userId}`
      );
      setTimeout(() => {
        console.log('Sending hi to', socket.id);
        socket.emit('hi');
      }, 1000); // For testing

      const userId = socket.data.userId;
      const presenceService = PresenceService.getInstance();
      const gameSessionService = GameSessionService.getInstance();
      presenceService.addUser(userId, socket.id);

      //TODO: payload interface is not yet defined
      socket.on('joinRoom', (payload) =>
        handleJoinRoom(socket, io, payload.roomId, payload.timeClass)
      );

      socket.on('makeMove', (payload) => handleMove(socket, io, payload));

      socket.on('resign', (payload) => handleMove(socket, io, payload));
      // socket.on('claim_timeout', (payload) => {
      //   handleMove(socket, io, payload, 'TIMEOUT');
      // });

      socket.on('disconnect', (reason) => {
        presenceService.removeUser(userId, socket.id);

        const gameSession = gameSessionService.getSessionByUserId(userId);
        if (gameSession) {
          handleGameDisconnect(socket, io);
        }

        console.log(`User ${userId} disconnected. Reason: ${reason}`);
      }); //TODO Disconnect function should not be defined here

      socket.on('message', (message) => {
        console.log(`${message.sender} said ${message.message}`);
      });
    }); // TODO: Message unused, to be removed
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
