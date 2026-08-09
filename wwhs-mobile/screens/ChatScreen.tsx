import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import client from '../services/client';
import { initSocket, getSocket } from '../services/socket';
import { useToast } from '../context/ToastContext';
import { AttachmentModal } from '../components/AttachmentModal';
import { CodeSnippetModal } from '../components/CodeSnippetModal';
import { MembersModal } from '../components/MembersModal';

type Message = {
  _id: string;
  text?: string;
  image?: string;
  imageURL?: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  } | string;
  createdAt: string;
  _optimistic?: boolean;
};

const ADMIN_EMAILS = [
  '25bph049@nith.ac.in',
  '25bph050@nith.ac.in',
  '25bph045@nith.ac.in',
  '25bph035@nith.ac.in',
];

export default function ChatScreen({ route, navigation }: any) {
  const { roomId, roomTitle, roomSlug } = route.params || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('Felix');
  const [customAvatarUri, setCustomAvatarUri] = useState<string | null>(null);

  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const { showToast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const uId = await AsyncStorage.getItem('userId');
      const uName = await AsyncStorage.getItem('userName');
      const uEmail = await AsyncStorage.getItem('userEmail');
      if (uId) {
        setUserId(uId);
        const seed = await AsyncStorage.getItem(`avatar_seed_${uId}`);
        const uri = await AsyncStorage.getItem(`avatar_uri_${uId}`);
        if (seed) setAvatarSeed(seed);
        if (uri) setCustomAvatarUri(uri);
      }
      if (uName) setUserName(uName);
      if (uEmail) setUserEmail(uEmail);
    };
    loadUser();
  }, []);

  // Fetch messages and setup Socket
  useEffect(() => {
    if (!roomId) return;

    client
      .get(`/api/chat/chat-history/${roomId}`)
      .then((res) => {
        const data = res.data;
        const msgList = Array.isArray(data) ? data : data?.messages || [];
        setMessages(msgList);
      })
      .catch(() => {});

    const socket = initSocket();
    if (!socket.connected) socket.connect();

    socket.emit('join_room', { room: roomId, userId });

    socket.on('send_message', (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [msg, ...prev];
      });
    });

    socket.on('typing_update', ({ userId: uid, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTyping) next.add(uid);
        else next.delete(uid);
        return next;
      });
    });

    socket.on('message_deleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    return () => {
      socket.off('send_message');
      socket.off('typing_update');
      socket.off('message_deleted');
    };
  }, [roomId, userId]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    if (!textToSend) return;

    if (customText === undefined) setInputText('');

    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: Message = {
      _id: tempId,
      text: textToSend,
      sender: { _id: userId, name: userName || 'You', email: userEmail },
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    setMessages((prev) => [optimisticMsg, ...prev]);

    try {
      const response = await client.post('/api/chat/send-message', {
        text: textToSend,
        sender: userId,
        room: roomId,
        roomId: roomSlug || roomId,
      });

      if (response.data?.messageDoc) {
        const realMsg = response.data.messageDoc;
        setMessages((prev) => prev.map((m) => (m._id === tempId ? realMsg : m)));
      }
    } catch (error: any) {
      showToast('Failed to send message', 'error');
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  const handlePickImage = async () => {
    setShowAttachmentModal(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        showToast('Uploading image...', 'info');

        const formData = new FormData();
        formData.append('image', {
          uri,
          name: 'upload.jpg',
          type: 'image/jpeg',
        } as any);
        formData.append('sender', userId);
        formData.append('room', roomId);

        const res = await client.post('/api/chat/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data?.messageDoc) {
          setMessages((prev) => [res.data.messageDoc, ...prev]);
          showToast('Image uploaded', 'success');
        }
      }
    } catch (err) {
      showToast('Image upload failed', 'error');
    }
  };

  const handleSendCode = (code: string) => {
    setShowCodeModal(false);
    const codeBlock = `\`\`\`\n${code}\n\`\`\``;
    handleSend(codeBlock);
  };

  const handleDeleteMessage = (msgId: string) => {
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/api/chat/delete-message/${msgId}`);
            setMessages((prev) => prev.filter((m) => m._id !== msgId));
            showToast('Message deleted', 'info');
          } catch (e) {
            showToast('Failed to delete message', 'error');
          }
        },
      },
    ]);
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isSenderObj = typeof item.sender === 'object' && item.sender !== null;
    const senderObj = isSenderObj ? (item.sender as { _id: string; name: string; email: string }) : null;
    const msgSenderId = senderObj ? senderObj._id : (item.sender as string);
    const isOwn = msgSenderId === userId;

    const msgSenderName = senderObj ? senderObj.name : 'Member';
    const msgSenderEmail = senderObj ? senderObj.email : '';
    const isAdmin = msgSenderEmail ? ADMIN_EMAILS.includes(msgSenderEmail.toLowerCase()) : false;

    const avatarUri = isOwn && customAvatarUri
      ? customAvatarUri
      : `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(msgSenderEmail || avatarSeed || 'Felix')}`;

    const text = item.text || '';
    const isCode = text.startsWith('```') && text.endsWith('```');
    const cleanCode = isCode ? text.slice(3, -3).trim() : text;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => isOwn && handleDeleteMessage(item._id)}
        style={[styles.msgRow, isOwn ? styles.msgRowOwn : styles.msgRowOther]}
      >
        {!isOwn && <Image source={{ uri: avatarUri }} style={styles.msgAvatar} />}

        <View style={[styles.msgBubble, isOwn ? styles.msgBubbleOwn : styles.msgBubbleOther]}>
          {!isOwn && (
            <View style={styles.msgSenderHeader}>
              <Text style={styles.msgSenderName}>{msgSenderName}</Text>
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
          )}

          {/* Image Message */}
          {(item.image || item.imageURL) && (
            <TouchableOpacity onPress={() => setViewImage(item.image || item.imageURL || null)}>
              <Image source={{ uri: item.image || item.imageURL }} style={styles.msgImage} />
            </TouchableOpacity>
          )}

          {/* Code or Text Message */}
          {text ? (
            isCode ? (
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{cleanCode}</Text>
              </View>
            ) : (
              <Text style={isOwn ? styles.msgTextOwn : styles.msgTextOther}>{text}</Text>
            )
          ) : null}

          <Text style={isOwn ? styles.msgTimeOwn : styles.msgTimeOther}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0a10" />
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <LinearGradient colors={['#0b0a10', '#0f0e1a', '#06050a']} style={StyleSheet.absoluteFillObject} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
          <Ionicons name="arrow-back" size={22} color="rgba(255, 255, 255, 0.9)" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>#{roomTitle || 'channel'}</Text>
          <Text style={styles.headerSubtitle}>
            {typingUsers.size > 0 ? 'Someone is typing...' : 'Live discussion'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowMembersModal(true)} style={styles.headerIconBtn}>
          <Ionicons name="people-outline" size={22} color="rgba(255, 255, 255, 0.85)" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item._id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
        />

        {/* Input Composer Bar */}
        <View style={styles.composerBar}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() => setShowAttachmentModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#4ade80" />
          </TouchableOpacity>

          <TextInput
            style={styles.composerInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="rgba(255, 255, 255, 0.35)"
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            activeOpacity={0.88}
          >
            <Feather name="send" size={18} color={inputText.trim() ? '#052e16' : 'rgba(255, 255, 255, 0.3)'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal visible={!!viewImage} transparent animationType="fade" onRequestClose={() => setViewImage(null)}>
        <View style={styles.fullImageModal}>
          <TouchableOpacity style={styles.closeImageBtn} onPress={() => setViewImage(null)}>
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          {viewImage && <Image source={{ uri: viewImage }} style={styles.fullImage} resizeMode="contain" />}
        </View>
      </Modal>

      {/* Modals */}
      <AttachmentModal
        visible={showAttachmentModal}
        onClose={() => setShowAttachmentModal(false)}
        onSelectImage={handlePickImage}
        onSelectCode={() => {
          setShowAttachmentModal(false);
          setShowCodeModal(true);
        }}
      />

      <CodeSnippetModal
        visible={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onSend={handleSendCode}
      />

      <MembersModal
        visible={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        roomTitle={roomTitle}
        currentUserId={userId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0a10' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerBackBtn: { padding: 4 },
  headerTitleBox: { alignItems: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  headerSubtitle: { color: '#4ade80', fontSize: 11, fontWeight: '600', marginTop: 2 },
  headerIconBtn: { padding: 4 },
  messagesList: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  msgRow: { flexDirection: 'row', gap: 10, marginVertical: 4 },
  msgRowOwn: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)' },
  msgBubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  msgBubbleOwn: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    borderBottomRightRadius: 4,
  },
  msgBubbleOther: {
    backgroundColor: 'hsla(0, 0%, 8%, 0.65)',
    borderWidth: 1,
    borderColor: 'hsla(0, 0%, 100%, 0.10)',
    borderBottomLeftRadius: 4,
  },
  msgSenderHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  msgSenderName: { color: '#4ade80', fontSize: 12, fontWeight: '800' },
  adminBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminBadgeText: { color: '#ef4444', fontSize: 9, fontWeight: '900' },
  msgTextOwn: { color: '#ffffff', fontSize: 14, lineHeight: 20 },
  msgTextOther: { color: 'rgba(255, 255, 255, 0.90)', fontSize: 14, lineHeight: 20 },
  msgTimeOwn: { color: 'rgba(255, 255, 255, 0.45)', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  msgTimeOther: { color: 'rgba(255, 255, 255, 0.40)', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  msgImage: { width: 200, height: 150, borderRadius: 14, marginVertical: 4 },
  codeContainer: {
    backgroundColor: '#12111f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 10,
    marginVertical: 4,
  },
  codeText: { color: '#4ade80', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'hsla(0, 0%, 8%, 0.90)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  composerInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  fullImageModal: { flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  closeImageBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  fullImage: { width: '100%', height: '80%' },
});
