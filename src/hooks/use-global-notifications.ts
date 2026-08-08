import { useEffect, useRef } from 'react';
import { getSocket } from '@/services/socket';
import { useBrowserNotifications } from './use-browser-notifications';
import { useNotificationSound } from './use-notification-sound';
import api from '@/services/api';

interface UserRoom {
    _id: string;
    title: string;
    roomId: string;
}

export function useGlobalNotifications(userId: string | null) {
    const { showNotification, requestPermission } = useBrowserNotifications();
    const { playSound } = useNotificationSound();
    const userRoomsRef = useRef<UserRoom[]>([]);
    const currentRoomRef = useRef<string | null>(null);

    const setCurrentRoom = (roomId: string | null) => {
        currentRoomRef.current = roomId;
    };

    useEffect(() => {
        if (!userId) return;
        requestPermission();

        const socket = getSocket();

        const fetchAndJoinRooms = async () => {
            try {
                const { data } = await api.get('/room/joined');
                const rooms: UserRoom[] = data.rooms;
                userRoomsRef.current = rooms;

                if (!socket.connected) socket.connect();

                rooms.forEach((room) => {
                    socket.emit('join_room', { room: room._id, userId });
                });
            } catch (error) {
                console.error('[Global Notifications] Failed to fetch rooms:', error);
            }
        };

        fetchAndJoinRooms();

        const handleGlobalMessage = (message: any) => {
            const senderId = message.sender?._id || message.sender;
            const roomId = message.room;

            if (senderId === userId || roomId === currentRoomRef.current) return;

            const room = userRoomsRef.current.find((r) => r._id === roomId);
            const roomTitle = room?.title || 'Chat';
            const senderName = message.sender?.name || 'Someone';
            const messageText = message.text || 'Sent an attachment';

            playSound();
            showNotification(`${senderName} in #${roomTitle}`, {
                body: messageText,
                icon: '/favicon.svg',
                tag: roomId,
            });
        };

        socket.on('receive_message', handleGlobalMessage);
        socket.on('received_message', handleGlobalMessage);

        return () => {
            socket.off('receive_message', handleGlobalMessage);
            socket.off('received_message', handleGlobalMessage);
        };
    }, [userId, showNotification, playSound, requestPermission]);

    return { setCurrentRoom };
}
