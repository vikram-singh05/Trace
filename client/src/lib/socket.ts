import { io, Socket } from 'socket.io-client';


let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {

      autoConnect: false,

      withCredentials: true,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
