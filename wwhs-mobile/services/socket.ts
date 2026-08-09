import { io, Socket } from 'socket.io-client';
import { API_URL } from '../constants/brand';

let socket: Socket | null = null;

export const initSocket = (token?: string) => {
    if (socket) return socket;

    socket = io(API_URL, {
        transports: ['websocket'],
        auth: { token },
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
