import { Server, Socket } from "socket.io";

// User presence: Map<userId, Set<socketId>>
const onlineUsers = new Map<string, Set<string>>();

// Typing state: Map<roomId, Set<userId>>
const typingUsers = new Map<string, Set<string>>();

function addOnlineUser(userId: string, socketId: string, io: Server) {
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }
    const wasOffline = onlineUsers.get(userId)!.size === 0;
    onlineUsers.get(userId)!.add(socketId);
    if (wasOffline) {
        io.emit("presence_update", { userId, status: "online" });
    }
}

function removeOnlineUser(userId: string, socketId: string, io: Server) {
    const sockets = onlineUsers.get(userId);
    if (!sockets) return;
    sockets.delete(socketId);
    if (sockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit("presence_update", { userId, status: "offline" });
        // Clean up typing state for this user across all rooms
        typingUsers.forEach((users, roomId) => {
            if (users.has(userId)) {
                users.delete(userId);
                io.to(roomId).emit("typing_update", { userId, isTyping: false });
            }
        });
    }
}

export function getOnlineUserIds(): string[] {
    return Array.from(onlineUsers.keys());
}

export const socketSetup = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`User connected ${socket.id}`);

        socket.on('join_room', (data: { room: string; userId?: string }) => {
            const room = typeof data === 'string' ? data : data.room;
            socket.join(room);

            // Store userId on socket for notification filtering
            if (typeof data === 'object' && data.userId) {
                (socket as any).userId = data.userId;
                addOnlineUser(data.userId, socket.id, io);
                // Send current online users list to the joining user
                socket.emit("online_users", getOnlineUserIds());
            }

            console.log(`User ${socket.id} (userId: ${(socket as any).userId || 'unknown'}) joined ${room}`);
        });

        socket.on('typing_start', (data: { room: string; userId: string }) => {
            if (!typingUsers.has(data.room)) {
                typingUsers.set(data.room, new Set());
            }
            typingUsers.get(data.room)!.add(data.userId);
            socket.to(data.room).emit("typing_update", { userId: data.userId, isTyping: true });
        });

        socket.on('typing_stop', (data: { room: string; userId: string }) => {
            const roomTyping = typingUsers.get(data.room);
            if (roomTyping) {
                roomTyping.delete(data.userId);
            }
            socket.to(data.room).emit("typing_update", { userId: data.userId, isTyping: false });
        });

        socket.on('send_message', async (data: any) => {
            console.log(`Message received: ${data}`);
        });

        socket.on('disconnect', () => {
            const userId = (socket as any).userId;
            if (userId) {
                removeOnlineUser(userId, socket.id, io);
            }
            console.log(`${socket.id} connection closed`);
        });
    });
};