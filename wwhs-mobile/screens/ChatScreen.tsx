import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, KeyboardAvoidingView, Platform, Image, Modal, Alert } from 'react-native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import client from '../services/client';
import { useToast } from '../context/ToastContext';

type RootStackParamList = {
  Chat: { roomId: string; roomTitle: string; roomSlug: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

type Message = {
  _id: string;
  text: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  imageURL?: string;
};

export default function ChatScreen({ route, navigation }: any) {
  const { roomId, roomTitle, roomSlug } = route.params || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  
  const { showToast } = useToast();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initChat = async () => {
      const uid = await AsyncStorage.getItem('userId');
      const uName = await AsyncStorage.getItem('userName');
      if (uid) setUserId(uid);
      if (uName) setUserName(uName);
      // Fetch email or assume for now

      fetchHistory();

      const newSocket = io('https://wwhs.vismay.dev', {
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        newSocket.emit('join_room', { roomId: roomSlug, userId: uid });
      });

      newSocket.on('new_message', (msg: Message) => {
        setMessages(prev => [msg, ...prev]);
      });

      newSocket.on('typing_update', (data: { user: string; isTyping: boolean }) => {
        if (data.user === uName) return;
        setTypingUsers(prev => {
          if (data.isTyping) {
            return prev.includes(data.user) ? prev : [...prev, data.user];
          } else {
            return prev.filter(u => u !== data.user);
          }
        });
      });

      newSocket.on('message_deleted', (data: { messageId: string }) => {
        setMessages(prev => prev.filter(m => m._id !== data.messageId));
      });

      setSocket(newSocket);
    };

    initChat();

    return () => {
      socket?.disconnect();
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await client.get(`/api/chat/chat-history/${roomId}`);
      setMessages(response.data.messages.reverse() || []);
    } catch (e) {
      showToast('Failed to load history', 'error');
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const tempId = Date.now().toString();
    const optimisticMsg: any = {
      _id: tempId,
      text: inputText,
      sender: { _id: userId, name: userName, email: userEmail },
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [optimisticMsg, ...prev]);
    setInputText('');
    socket?.emit('typing_stop', { roomId: roomSlug, user: userName });

    try {
      const res = await client.post('/api/chat/send-message', {
        text: optimisticMsg.text,
        sender: userId,
        room: roomId,
        roomId: roomSlug
      });
      // Replace optimistic message with actual
      setMessages(prev => prev.map(m => m._id === tempId ? res.data.message : m));
    } catch (e) {
      showToast('Failed to send message', 'error');
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    if (socket) {
      socket.emit('typing_start', { roomId: roomSlug, user: userName });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { roomId: roomSlug, user: userName });
      }, 2000);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('image', {
        uri: asset.uri,
        name: 'upload.jpg',
        type: 'image/jpeg'
      } as any);
      formData.append('sender', userId);
      formData.append('room', roomId);
      formData.append('roomId', roomSlug);

      try {
        await client.post('/api/chat/send-message', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (e) {
        showToast('Failed to send image', 'error');
      }
    }
  };

  const deleteMessage = async (msgId: string) => {
    try {
      await client.delete(`/api/chat/delete-message/${msgId}`);
      setMessages(prev => prev.filter(m => m._id !== msgId));
    } catch (e) {
      showToast('Failed to delete message', 'error');
    }
  };

  const renderMessageText = (text: string) => {
    const codeRegex = /```([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<Text key={lastIndex}>{text.substring(lastIndex, match.index)}</Text>);
      }
      parts.push(
        <View key={match.index} style={styles.codeBlock}>
          <Text style={styles.codeText}>{match[1].trim()}</Text>
        </View>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(<Text key={lastIndex}>{text.substring(lastIndex)}</Text>);
    }

    return parts.length > 0 ? parts : <Text>{text}</Text>;
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isOwn = item.sender?._id === userId;
    return (
      <TouchableOpacity
        onLongPress={() => {
          if (isOwn) {
            Alert.alert('Delete Message', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(item._id) }
            ]);
          }
        }}
        delayLongPress={500}
      >
        <View style={[styles.messageWrapper, isOwn ? styles.messageWrapperOwn : {}]}>
          {!isOwn && (
             <Image 
               source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${item.sender?.email || 'default'}` }}
               style={styles.avatar}
             />
          )}
          <View style={[styles.messageBubble, isOwn ? styles.messageBubbleOwn : {}]}>
            {!isOwn && <Text style={styles.senderName}>{item.sender?.name || 'Unknown'}</Text>}
            {item.imageURL && (
              <Image source={{ uri: item.imageURL }} style={styles.messageImage} />
            )}
            {item.text ? <Text style={styles.messageText}>{renderMessageText(item.text)}</Text> : null}
            <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const fetchMembers = async () => {
    try {
      const res = await client.get('/api/auth/members');
      setMembers(res.data.members || res.data);
      setMembersModalVisible(true);
    } catch (e) {
      showToast('Failed to fetch members', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{roomTitle}</Text>
        <TouchableOpacity onPress={fetchMembers} style={styles.headerBtn}>
          <Ionicons name="people-outline" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          inverted
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
        />

        {typingUsers.length > 0 && (
          <Text style={styles.typingIndicator}>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </Text>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.attachBtn}>
            <Feather name="paperclip" size={20} color="rgba(255,255,255,0.65)" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            multiline
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
            <Feather name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={membersModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Members</Text>
              <TouchableOpacity onPress={() => setMembersModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={members}
              keyExtractor={item => item._id}
              renderItem={({item}) => (
                <View style={styles.memberItem}>
                  <Image source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${item.email}` }} style={styles.avatar} />
                  <Text style={styles.memberName}>{item.name}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0a10' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#0b0a10',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  headerBtn: { padding: 4 },
  headerTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: 'bold' },
  chatContainer: { flex: 1 },
  listContent: { padding: 16, gap: 12 },
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, maxWidth: '85%' },
  messageWrapperOwn: { alignSelf: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
  messageBubble: {
    backgroundColor: 'rgba(15, 14, 22, 0.6)',
    padding: 12, borderRadius: 16, borderBottomLeftRadius: 4,
  },
  messageBubbleOwn: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderBottomLeftRadius: 16, borderBottomRightRadius: 4,
  },
  senderName: { color: '#4ade80', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  messageText: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 22 },
  timestamp: { color: 'rgba(255,255,255,0.4)', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  messageImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 8 },
  codeBlock: { backgroundColor: '#1a1625', padding: 8, borderRadius: 8, marginVertical: 4 },
  codeText: { fontFamily: 'monospace', color: '#4ade80', fontSize: 13 },
  typingIndicator: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginLeft: 16, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#0b0a10'
  },
  attachBtn: { padding: 12 },
  input: {
    flex: 1, backgroundColor: 'rgba(15, 14, 22, 0.6)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    color: '#fff', maxHeight: 100, marginRight: 8
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#22c55e',
    justifyContent: 'center', alignItems: 'center'
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1a1625', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '70%', minHeight: '50%'
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  memberItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  memberName: { color: '#fff', fontSize: 16 }
});
