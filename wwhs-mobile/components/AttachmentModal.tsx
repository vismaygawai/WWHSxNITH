import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Modal, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

interface AttachmentModalProps {
    visible: boolean;
    onClose: () => void;
    onCodePress: () => void;
    onImagePress: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({ visible, onClose, onCodePress, onImagePress }) => {
    const scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 5,
                tension: 40,
            }).start();
        } else {
            Animated.timing(scale, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View style={[styles.bubble, { transform: [{ scale }] }]}>
                            <TouchableOpacity style={styles.button} onPress={() => { onClose(); onCodePress(); }}>
                                <Feather name="code" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => { onClose(); onImagePress(); }}>
                                <Feather name="image" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    bubble: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        backgroundColor: Colors.surfaceSolid,
        borderRadius: 24,
        padding: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    button: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.surfaceCard,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
