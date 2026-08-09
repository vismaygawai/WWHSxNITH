import React from 'react';
import { Modal, StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { User } from '../types';

interface MembersModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    members: User[];
    onInvite: () => void;
}

export const MembersModal: React.FC<MembersModalProps> = ({ visible, onClose, title, members, onInvite }) => {
    
    const renderMember = ({ item }: { item: User }) => (
        <View style={styles.memberRow}>
            <Image 
                source={{ uri: item.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${item._id}` }} 
                style={styles.avatar} 
            />
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberEmail}>{item.email}</Text>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.sheet}>
                            <View style={styles.header}>
                                <View>
                                    <Text style={styles.title}>{title}</Text>
                                    <Text style={styles.subtitle}>{members.length} members</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <Feather name="x" size={24} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={members}
                                keyExtractor={(item) => item._id}
                                renderItem={renderMember}
                                contentContainerStyle={styles.list}
                            />

                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.inviteBtn} onPress={onInvite}>
                                    <Feather name="user-plus" size={20} color="#fff" />
                                    <Text style={styles.inviteText}>Invite People</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        height: height * 0.8,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    closeBtn: {
        padding: 8,
    },
    list: {
        padding: 20,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: Colors.surfaceCard,
    },
    memberInfo: {
        marginLeft: 12,
        flex: 1,
    },
    memberName: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    memberEmail: {
        color: Colors.textMuted,
        fontSize: 14,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    inviteBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    inviteText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
