import Fastify from 'fastify';
import { Server } from 'socket.io';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type, Static } from '@sinclair/typebox';
import { handleMove } from 'controllers/moveController.js';
import { handleJoinRoom } from 'controllers/roomController.js';
import { handleDisconnect } from 'controllers/disconnectController.js';

// --- Schemas ---
const MessageSchema = Type.Object({
  sender: Type.String(),
  message: Type.String({ minLength: 1, maxLength: 500 }),
  timestamp: Type.Optional(Type.Number()),
});

// --- Infer Typescript type from schemas ---
type Message = Static<typeof MessageSchema>;

const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

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

const start = async () => {
  try {
    await fastify.ready();

    const io = new Server(fastify.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      fastify.log.info(`User joined: ${socket.id}`);
      setTimeout(() => {
        console.log('Sending hi to', socket.id);
        socket.emit('hi');
      }, 1000);

      socket.on('joinRoom', (roomId) => handleJoinRoom(socket, io, roomId));

      socket.on('makeMove', (payload) => handleMove(socket, io, payload));

      socket.on('disconnect', () => handleDisconnect(socket, io));

      socket.on('message', (message) => {
        console.log(`${message.sender} said ${message.message}`);
      });
    });

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
