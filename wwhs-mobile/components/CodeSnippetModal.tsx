import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, Platform } from 'react-native';
import { Colors } from '../constants/theme';

interface CodeSnippetModalProps {
    visible: boolean;
    onClose: () => void;
    onShare: (code: string) => void;
}

export const CodeSnippetModal: React.FC<CodeSnippetModalProps> = ({ visible, onClose, onShare }) => {
    const [code, setCode] = useState('');

    const handleShare = () => {
        if (code.trim()) {
            onShare(code);
            setCode('');
            onClose();
        }
    };

    const handleClose = () => {
        setCode('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>New Snippet</Text>
                    <TouchableOpacity 
                        onPress={handleShare} 
                        disabled={!code.trim()}
                        style={[styles.shareButton, !code.trim() && styles.shareDisabled]}
                    >
                        <Text style={styles.shareText}>Share</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.input}
                    multiline
                    autoFocus
                    placeholder="Write or paste your code here..."
                    placeholderTextColor={Colors.textMuted}
                    value={code}
                    onChangeText={setCode}
                    textAlignVertical="top"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerButton: {
        padding: 8,
    },
    cancelText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    shareButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    shareDisabled: {
        opacity: 0.5,
    },
    shareText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    input: {
        flex: 1,
        color: '#e2e8f0',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        padding: 16,
    }
});
