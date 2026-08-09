import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
  StatusBar,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../services/client';
import { useToast } from '../context/ToastContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

type Room = {
  _id: string;
  roomId: string;
  title: string;
  description: string;
  members?: string[];
};

export default function RoomScreen({ navigation }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [customAvatarUri, setCustomAvatarUri] = useState<string | null>(null);

  const { showToast } = useToast();

  const loadUserData = async () => {
    const name = await AsyncStorage.getItem('userName');
    const email = await AsyncStorage.getItem('userEmail');
    const id = await AsyncStorage.getItem('userId');
    if (name) setUserName(name);
    if (email) setUserEmail(email);
    if (id) {
      setUserId(id);
      const seed = await AsyncStorage.getItem(`avatar_seed_${id}`);
      const uri = await AsyncStorage.getItem(`avatar_uri_${id}`);
      if (seed) setAvatarSeed(seed);
      if (uri) setCustomAvatarUri(uri);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await client.get('/api/room/allRooms');
      const roomsData = response.data?.rooms || response.data || [];
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (error: any) {
      showToast('Failed to load rooms', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
    fetchRooms();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const handleJoinRoom = (room: Room) => {
    navigation.navigate('Chat', {
      roomId: room._id,
      roomTitle: room.title,
      roomSlug: room.roomId,
    });
  };

  const currentAvatarUrl = customAvatarUri
    ? customAvatarUri
    : `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(avatarSeed || userEmail || 'Felix')}`;

  const filteredRooms = rooms.filter(
    (r) =>
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0a10" />
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <LinearGradient colors={['#0b0a10', '#0d0c16', '#06050a']} style={StyleSheet.absoluteFillObject} />
      </View>

      {/* Luxury Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={['rgba(34, 197, 94, 0.25)', 'rgba(34, 197, 94, 0.05)']} style={styles.logoBadge}>
            <Text style={styles.logoText}>W</Text>
          </LinearGradient>
          <View>
            <Text style={styles.brandTitle}>WWHS? x NITH</Text>
            <Text style={styles.greetingText}>Welcome, {userName || 'Member'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.profileAvatarWrapper} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
          <Image source={{ uri: currentAvatarUrl }} style={styles.profileAvatar} />
        </TouchableOpacity>
      </View>

      {/* Search & Channel Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255, 255, 255, 0.4)" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search channels..."
            placeholderTextColor="rgba(255, 255, 255, 0.35)"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Rooms List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item._id || item.roomId}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.roomCard}
              onPress={() => handleJoinRoom(item)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Text style={styles.cardIconText}>{item.title?.charAt(0) || '#'}</Text>
                </View>
                <View style={styles.cardTitleBox}>
                  <Text style={styles.cardTitle}>#{item.title}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={2}>
                    {item.description || 'Live community discussion channel.'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.memberBadge}>
                  <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.memberBadgeText}>{item.members?.length || 1} members</Text>
                </View>
                <View style={styles.joinBtn}>
                  <Text style={styles.joinBtnText}>Join</Text>
                  <Ionicons name="chevron-forward" size={16} color="#4ade80" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0a10' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  brandTitle: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  greetingText: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, fontWeight: '600' },
  profileAvatarWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#22c55e',
    padding: 1.5,
  },
  profileAvatar: { width: '100%', height: '100%', borderRadius: 20 },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 30, gap: 14 },
  roomCard: {
    backgroundColor: 'hsla(0, 0%, 8%, 0.65)',
    borderWidth: 1,
    borderColor: 'hsla(0, 0%, 100%, 0.10)',
    borderRadius: 22,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  cardHeader: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: { color: '#4ade80', fontSize: 20, fontWeight: '800' },
  cardTitleBox: { flex: 1 },
  cardTitle: { color: '#ffffff', fontSize: 17, fontWeight: '800', marginBottom: 4 },
  cardSubtitle: { color: 'rgba(255, 255, 255, 0.55)', fontSize: 13, lineHeight: 18 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberBadgeText: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, fontWeight: '600' },
  joinBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  joinBtnText: { color: '#4ade80', fontSize: 14, fontWeight: '700' },
});
