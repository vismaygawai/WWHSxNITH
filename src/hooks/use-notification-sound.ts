import { useCallback, useRef } from 'react';

export function useNotificationSound() {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playSound = useCallback(() => {
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio('/notification.mp3');
                audioRef.current.volume = 0.5;
            }
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        } catch {}
    }, []);

    return { playSound };
}
