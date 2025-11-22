import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Server as ServerType } from 'http';
import { Socket } from 'socket.io';

export type NextApiResponseServerIO = Response & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const ioHandler = (req: any, res: any) => {
  if (!res.socket.server.io) {
    const httpServer: ServerType = res.socket.server;
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    res.socket.server.io = io;

    io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      // Join user to their room
      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });

      // Handle new message
      socket.on('new-message', (data: { roomId: string; message: string; sender: string }) => {
        console.log('New message:', data);
        // Broadcast to all clients in the room (including sender)
        io.to(data.roomId).emit('message-received', data);
      });

      // Handle typing indicator
      socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
        socket.to(data.roomId).emit('user-typing', {
          isTyping: data.isTyping,
          senderId: socket.id,
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  res.end();
};
