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
import * as WebBrowser from 'expo-web-browser';
import { WWHSLogo } from '../components/WWHSLogo';
import { GoogleIcon } from '../components/GoogleIcon';
import client from '../services/client';
import { useToast } from '../context/ToastContext';
import { syncPushToken } from '../services/notification';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: any;
};

const GOOGLE_CLIENT_ID = "182255210945-ecnl2fl1p6hn74d3dlbr4lo28h5vtnmt.apps.googleusercontent.com";

export default function LoginScreen({ navigation, route }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (route.params?.google) {
      handleGoogleSignIn();
    }
  }, [route.params]);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    const mail = email.trim().toLowerCase();
    if (!mail.endsWith('@nith.ac.in')) {
      showToast('Only @nith.ac.in email addresses can join.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await client.post('/api/auth/login', { email: mail, password });
      const { user, token } = response.data;
      if (token) {
        await AsyncStorage.setItem('token', token);
      }
      await AsyncStorage.setItem('userId', user._id || user.id);
      await AsyncStorage.setItem('userName', user.name);
      await AsyncStorage.setItem('userEmail', user.email);

      showToast('Signed in successfully!', 'success');
      syncPushToken();
      navigation.replace('Room');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      showToast('Connecting to Google Auth...', 'info');
      const redirectUri = 'https://wwhs.vismay.dev/login';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=token&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(redirectUri)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const url = result.url;
        const tokenMatch = url.match(/access_token=([^&]+)/);
        if (tokenMatch) {
          const accessToken = tokenMatch[1];
          const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const profile = await profileRes.json();

          if (profile.email) {
            if (!profile.email.endsWith('@nith.ac.in')) {
              showToast('Only @nith.ac.in Google accounts can join.', 'error');
              setLoading(false);
              return;
            }
            const authRes = await client.post('/api/auth/google', {
              email: profile.email,
              name: profile.name,
            });
            const { user, token } = authRes.data;
            if (token) await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userId', user._id || user.id);
            await AsyncStorage.setItem('userName', user.name);
            await AsyncStorage.setItem('userEmail', user.email);

            showToast('Signed in with Google!', 'success');
            syncPushToken();
            navigation.replace('Room');
            return;
          }
        }
      }

      // If user typed email manually, attempt direct auth endpoint fallback
      if (email.trim().toLowerCase().endsWith('@nith.ac.in')) {
        const authRes = await client.post('/api/auth/google', { email: email.trim().toLowerCase() });
        const { user, token } = authRes.data;
        if (token) await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('userId', user._id || user.id);
        await AsyncStorage.setItem('userName', user.name);
        await AsyncStorage.setItem('userEmail', user.email);
        showToast('Signed in with Google!', 'success');
        syncPushToken();
        navigation.replace('Room');
        return;
      }
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
        <LinearGradient colors={['#0b0a10', '#0e0d16', '#06050a']} style={StyleSheet.absoluteFillObject} />
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
        {/* 1:1 Website Glass Card */}
        <View style={styles.glassCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.innerLogoBadge}>
              <WWHSLogo size={28} />
            </View>
            <Text style={styles.title}>Members only</Text>
          </View>

          <Text style={styles.subtitle}>
            Use your institute account — like <Text style={styles.emeraldText}>24bcs999@nith.ac.in</Text>.
          </Text>

          {/* Website Matching Google Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.googleBtn}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon size={18} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@nith.ac.in"
              placeholderTextColor="rgba(255, 255, 255, 0.35)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.passwordWrapper}>
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
                style={styles.eyeBtn}
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
            style={styles.forgotPassBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#052e16" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign in</Text>
            )}
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
    backgroundColor: 'hsla(0, 0%, 8%, 0.62)',
    borderWidth: 1,
    borderColor: 'hsla(0, 0%, 100%, 0.10)',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  innerLogoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
  },
  emeraldText: {
    color: '#4ade80',
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  googleBtnText: {
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
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  inputGroup: {
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
  passwordWrapper: {
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
  eyeBtn: {
    paddingHorizontal: 14,
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPassText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#052e16',
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
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
