import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import client from '../services/client';
import { useToast } from '../context/ToastContext';
import { syncPushToken } from '../services/notification';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: any;
};

export default function LoginScreen({ navigation, route }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (route.params?.google) {
      showToast('Google Sign-In ready. Enter your @nith.ac.in address or password to proceed.', 'info');
    }
  }, [route.params]);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    const cleanMail = email.trim().toLowerCase();
    if (!cleanMail.endsWith('@nith.ac.in')) {
      showToast('Only @nith.ac.in email addresses can join.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await client.post('/api/auth/login', { email: cleanMail, password });
      const { user, token } = response.data;
      if (token) {
        await AsyncStorage.setItem('token', token);
      }
      await AsyncStorage.setItem('userId', user._id || user.id);
      await AsyncStorage.setItem('userName', user.name);
      await AsyncStorage.setItem('userEmail', user.email);

      showToast('Logged in successfully', 'success');
      syncPushToken();
      navigation.replace('Room');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    showToast('Redirecting to Google Auth Service...', 'info');
    // Prompt for Google email or connect via standard client
    if (!email || !email.endsWith('@nith.ac.in')) {
      showToast('Enter your @nith.ac.in address above first', 'info');
      return;
    }
    setLoading(true);
    try {
      const response = await client.post('/api/auth/google', { email: email.trim().toLowerCase() });
      const { user, token } = response.data;
      if (token) {
        await AsyncStorage.setItem('token', token);
      }
      await AsyncStorage.setItem('userId', user._id || user.id);
      await AsyncStorage.setItem('userName', user.name);
      await AsyncStorage.setItem('userEmail', user.email);
      showToast('Signed in with Google!', 'success');
      syncPushToken();
      navigation.replace('Room');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Google Auth failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0a10" />
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <LinearGradient
          colors={['#0b0a10', '#100f1a', '#06050a']}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.12)', 'transparent']}
          start={{ x: 0.8, y: 0.1 }}
          end={{ x: 0.2, y: 0.8 }}
          style={styles.glowOverlay}
        />
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color="rgba(255, 255, 255, 0.9)" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Glass Form Card */}
        <View style={styles.glassCard}>
          <Text style={styles.title}>Members only</Text>
          <Text style={styles.subtitle}>
            Use your institute account — like <Text style={styles.emeraldText}>24bcs999@nith.ac.in</Text>.
          </Text>

          {/* Continue with Google */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIconLetter}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="24bcs999@nith.ac.in"
              placeholderTextColor="rgba(255, 255, 255, 0.35)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(255, 255, 255, 0.35)"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="rgba(255, 255, 255, 0.45)"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientSubmit}
            >
              {loading ? (
                <ActivityIndicator color="#052e16" />
              ) : (
                <Text style={styles.submitButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0a10',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    padding: 16,
    marginLeft: 8,
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: 'center',
    flexGrow: 1,
  },
  glassCard: {
    backgroundColor: 'hsla(0, 0%, 8%, 0.65)',
    borderWidth: 1,
    borderColor: 'hsla(0, 0%, 100%, 0.10)',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  emeraldText: {
    color: '#4ade80',
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconLetter: {
    color: '#4285F4',
    fontSize: 12,
    fontWeight: '900',
  },
  googleButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 16,
    gap: 6,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 15,
  },
  eyeButton: {
    paddingHorizontal: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  gradientSubmit: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#052e16',
    fontSize: 16,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 14,
  },
  footerLink: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '700',
  },
});
