import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onHide }) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 50,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {
                onHide();
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, [message, type]);

    const getColors = () => {
        switch (type) {
            case 'success': return 'rgba(16, 185, 129, 0.9)'; // emerald
            case 'error': return 'rgba(239, 68, 68, 0.9)'; // red
            case 'info': return 'rgba(59, 130, 246, 0.9)'; // blue
            default: return 'rgba(16, 185, 129, 0.9)';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'alert-circle';
            case 'info': return 'info';
            default: return 'check-circle';
        }
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY }], opacity, backgroundColor: getColors() }]}>
            <Feather name={getIcon() as any} size={20} color={Colors.textPrimary} style={styles.icon} />
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        width: '90%',
        borderRadius: 12,
        zIndex: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    icon: {
        marginRight: 12,
    },
    text: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '500',
    }
});
