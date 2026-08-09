import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../services/client';
import { useToast } from '../context/ToastContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function ProfileScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  const { showToast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const uName = await AsyncStorage.getItem('userName');
      const uEmail = await AsyncStorage.getItem('userEmail'); // assuming stored, else use default
      if (uName) setName(uName);
      if (uEmail) setEmail(uEmail);
    };
    loadUser();
  }, []);

  const handleUpdateProfile = async () => {
    setLoadingProfile(true);
    try {
      await client.put('/api/auth/update-profile', { name });
      await AsyncStorage.setItem('userName', name);
      showToast('Profile updated', 'success');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setLoadingPassword(true);
    try {
      await client.post('/api/auth/change-pass/viaOldPass', { 
        email, 
        oldPassword, 
        newPassword 
      });
      showToast('Password changed', 'success');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${email || 'user'}` }} 
            style={styles.avatar} 
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS (Read-only)</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={email}
              editable={false}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={loadingProfile}>
            {loadingProfile ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>OLD PASSWORD</Text>
            <TextInput style={styles.input} secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NEW PASSWORD</Text>
            <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
            <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loadingPassword}>
            {loadingPassword ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Update Password</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.destructiveButton} onPress={handleLogout}>
          <Text style={styles.destructiveButtonText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0a10' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  headerBtn: { padding: 4, width: 32 },
  headerTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  card: {
    backgroundColor: 'rgba(15, 14, 22, 0.6)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 24, gap: 16
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  inputGroup: { gap: 8 },
  label: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 'bold' },
  input: {
    backgroundColor: '#0A0514', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 16, color: '#fff'
  },
  readOnlyInput: { opacity: 0.6 },
  button: {
    backgroundColor: '#22c55e', padding: 16, borderRadius: 9999,
    alignItems: 'center', marginTop: 8
  },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  destructiveButton: {
    backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ef4444',
    padding: 16, borderRadius: 9999, alignItems: 'center'
  },
  destructiveButtonText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});
