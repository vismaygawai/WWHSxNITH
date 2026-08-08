import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns the singleton Socket.IO client instance.
 * Lazy-initializes on first call. Does NOT auto-connect —
 * call socket.connect() explicitly after the user is authenticated.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io("/", {
      withCredentials: true,
      autoConnect: false,
      // Aggressive heartbeat for fast ghost-connection detection
      // (matches server's pingInterval: 5000, pingTimeout: 10000)
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
}

/**
 * Fully disconnect and destroy the socket instance.
 * Call on logout.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
