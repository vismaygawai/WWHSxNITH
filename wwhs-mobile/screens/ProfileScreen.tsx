import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import client from '../services/client';
import { useToast } from '../context/ToastContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const AVATAR_SEEDS = [
  'Felix',
  'Aneka',
  'Jack',
  'Zoe',
  'Oliver',
  'Maya',
  'Leo',
  'Bella',
  'Sam',
  'Ruby',
  'Jasper',
  'Luna',
  'Milo',
  'Willow',
  'Aiden',
  'Freya',
];

export default function ProfileScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('Felix');
  const [customAvatarUri, setCustomAvatarUri] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customSeedInput, setCustomSeedInput] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const uName = await AsyncStorage.getItem('userName');
      const uEmail = await AsyncStorage.getItem('userEmail');
      const uId = await AsyncStorage.getItem('userId');
      const savedSeed = await AsyncStorage.getItem(`avatar_seed_${uId}`);
      const savedUri = await AsyncStorage.getItem(`avatar_uri_${uId}`);

      if (uName) setName(uName);
      if (uEmail) setEmail(uEmail);
      if (uId) setUserId(uId);
      if (savedSeed) setAvatarSeed(savedSeed);
      if (savedUri) setCustomAvatarUri(savedUri);
    };
    loadUser();
  }, []);

  const handleSelectSeed = async (seed: string) => {
    setAvatarSeed(seed);
    setCustomAvatarUri(null);
    if (userId) {
      await AsyncStorage.setItem(`avatar_seed_${userId}`, seed);
      await AsyncStorage.removeItem(`avatar_uri_${userId}`);
    }
    setShowAvatarModal(false);
    showToast(`Avatar updated to "${seed}"`, 'success');
  };

  const handleApplyCustomSeed = async () => {
    if (!customSeedInput.trim()) return;
    const seed = customSeedInput.trim();
    handleSelectSeed(seed);
    setCustomSeedInput('');
  };

  const handlePickGalleryImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast('Permission to access photo gallery was denied', 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setCustomAvatarUri(uri);
        if (userId) {
          await AsyncStorage.setItem(`avatar_uri_${userId}`, uri);
        }
        setShowAvatarModal(false);
        showToast('Profile photo updated!', 'success');
      }
    } catch (err) {
      showToast('Failed to pick photo', 'error');
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    setLoadingProfile(true);
    try {
      await client.put('/api/auth/update-profile', { name: name.trim() });
      await AsyncStorage.setItem('userName', name.trim());
      showToast('Profile name updated successfully', 'success');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all password fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setLoadingPassword(true);
    try {
      await client.post('/api/auth/change-pass/viaOldPass', {
        email,
        oldPassword,
        newPassword,
      });
      showToast('Password changed successfully', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Password change failed', 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await client.post('/api/auth/logout');
    } catch (e) {
      // ignore
    }
    await AsyncStorage.clear();
    navigation.replace('Welcome');
  };

  const currentAvatarUrl = customAvatarUri
    ? customAvatarUri
    : `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(avatarSeed || email || 'Felix')}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0a10" />
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <LinearGradient colors={['#0b0a10', '#0e0d16', '#06050a']} style={StyleSheet.absoluteFillObject} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Interactive Avatar Area */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={() => setShowAvatarModal(true)} activeOpacity={0.85}>
            <Image source={{ uri: currentAvatarUrl }} style={styles.avatarImage} />
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#052e16" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAvatarModal(true)}>
            <Text style={styles.changeAvatarText}>Change Avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.glassCard}>
          <Text style={styles.cardHeaderTitle}>Personal Info</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor="rgba(255,255,255,0.35)"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>EMAIL ADDRESS (READ ONLY)</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={loadingProfile} activeOpacity={0.88}>
            <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.gradientBtn}>
              {loadingProfile ? <ActivityIndicator color="#052e16" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Password Card */}
        <View style={styles.glassCard}>
          <Text style={styles.cardHeaderTitle}>Change Password</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>CURRENT PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.35)"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>NEW PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.35)"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.35)"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword} disabled={loadingPassword} activeOpacity={0.88}>
            <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.gradientBtn}>
              {loadingPassword ? <ActivityIndicator color="#052e16" /> : <Text style={styles.saveButtonText}>Update Password</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Avatar Picker Modal */}
      <Modal visible={showAvatarModal} animationType="slide" transparent onRequestClose={() => setShowAvatarModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar Style</Text>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            {/* Choose from Photo Library */}
            <TouchableOpacity style={styles.photoPickerBtn} onPress={handlePickGalleryImage}>
              <Ionicons name="image-outline" size={20} color="#4ade80" />
              <Text style={styles.photoPickerText}>Choose Photo from Device Gallery</Text>
            </TouchableOpacity>

            <Text style={styles.presetSectionTitle}>Or select a DiceBear character:</Text>

            <FlatList
              data={AVATAR_SEEDS}
              numColumns={4}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.avatarGrid}
              renderItem={({ item }) => {
                const selected = avatarSeed === item && !customAvatarUri;
                return (
                  <TouchableOpacity
                    style={[styles.seedItem, selected && styles.seedItemSelected]}
                    onPress={() => handleSelectSeed(item)}
                  >
                    <Image
                      source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${item}` }}
                      style={styles.seedImage}
                    />
                    <Text style={[styles.seedName, selected && styles.seedNameSelected]}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
            />

            {/* Custom Seed Input */}
            <View style={styles.customSeedRow}>
              <TextInput
                style={styles.customSeedInput}
                value={customSeedInput}
                onChangeText={setCustomSeedInput}
                placeholder="Custom seed name..."
                placeholderTextColor="rgba(255,255,255,0.35)"
              />
              <TouchableOpacity style={styles.applySeedBtn} onPress={handleApplyCustomSeed}>
                <Text style={styles.applySeedText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerBtn: { padding: 4 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatarWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#22c55e',
    padding: 2,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 46 },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: '#22c55e',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0b0a10',
  },
  changeAvatarText: { color: '#4ade80', fontSize: 14, fontWeight: '700', marginTop: 10 },
  glassCard: {
    backgroundColor: 'hsla(0, 0%, 8%, 0.65)',
    borderWidth: 1,
    borderColor: 'hsla(0, 0%, 100%, 0.10)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    gap: 16,
  },
  cardHeaderTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  formGroup: { gap: 6 },
  label: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 15,
  },
  disabledInput: { opacity: 0.5 },
  saveButton: { borderRadius: 16, overflow: 'hidden', marginTop: 6 },
  gradientBtn: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#052e16', fontSize: 15, fontWeight: '800' },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#ef4444', fontSize: 15, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#12111d',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  photoPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 20,
  },
  photoPickerText: { color: '#4ade80', fontSize: 14, fontWeight: '700' },
  presetSectionTitle: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '700', marginBottom: 14 },
  avatarGrid: { paddingBottom: 10 },
  seedItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  seedItemSelected: { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  seedImage: { width: 52, height: 52, borderRadius: 26, marginBottom: 4 },
  seedName: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' },
  seedNameSelected: { color: '#4ade80', fontWeight: '800' },
  customSeedRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  customSeedInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
  },
  applySeedBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applySeedText: { color: '#052e16', fontWeight: '800', fontSize: 14 },
});
