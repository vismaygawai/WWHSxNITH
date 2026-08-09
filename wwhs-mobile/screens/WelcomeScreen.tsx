import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WWHSLogo } from '../components/WWHSLogo';
import { GoogleIcon } from '../components/GoogleIcon';
import { useToast } from '../context/ToastContext';
import client from '../services/client';
import { syncPushToken } from '../services/notification';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const GOOGLE_CLIENT_ID = "182255210945-ecnl2fl1p6hn74d3dlbr4lo28h5vtnmt.apps.googleusercontent.com";

export default function WelcomeScreen({ navigation }: Props) {
  const { showToast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      showToast('Opening Google Sign-In...', 'info');
      const redirectUri = 'https://wwhs.vismay.dev/login';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=token&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(redirectUri)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      if (result.type === 'success' && result.url) {
        // Extract params from redirect URL
        const url = result.url;
        const access_token_match = url.match(/access_token=([^&]+)/);
        if (access_token_match) {
          const accessToken = access_token_match[1];
          // Fetch Google User Profile
          const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const profile = await profileRes.json();

          if (profile.email) {
            if (!profile.email.endsWith('@nith.ac.in')) {
              showToast('Only @nith.ac.in Google accounts can join.', 'error');
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
      // Fallback redirect to Login screen
      navigation.navigate('Login', { google: true });
    } catch (error: any) {
      console.log('Google Auth error:', error);
      navigation.navigate('Login', { google: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0a10" />

      {/* DarkVeil Background Glow */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <LinearGradient colors={['#0b0a10', '#0e0d16', '#06050a']} style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.14)', 'transparent', 'rgba(16, 185, 129, 0.04)']}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.8, y: 0.9 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.topAmbientGlow} />
      </View>

      <View style={styles.content}>
        {/* Top Outer Logo Badge with wwhs.svg */}
        <View style={styles.logoBadgeOuter}>
          <WWHSLogo size={34} />
        </View>

        <Text style={styles.brandTitle}>WWHS? x NITH</Text>

        <Text style={styles.heroHeading}>
          The perfect group{'\n'}
          <Text style={styles.emeraldHighlight}>icon doesn't exi........</Text>
        </Text>

        <Text style={styles.subtitle}>
          A members-only live chat community for NITH tech enthusiasts.
        </Text>

        {/* Action Buttons matching Website */}
        <View style={styles.actionGroup}>
          {/* Continue with Google */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.googleBtn}
            onPress={handleGoogleSignIn}
          >
            <GoogleIcon size={18} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Get Started / Sign Up */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={16} color="#052e16" />
          </TouchableOpacity>

          {/* Sign In */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryBtnText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0a10',
  },
  topAmbientGlow: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    width: width * 0.95,
    height: width * 0.95,
    borderRadius: (width * 0.95) / 2,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoBadgeOuter: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'hsla(0, 0%, 8%, 0.62)',
    borderWidth: 1,
    borderColor: 'hsla(0, 0%, 100%, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
  },
  heroHeading: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 40,
  },
  emeraldHighlight: {
    color: '#4ade80',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
    maxWidth: 320,
  },
  actionGroup: {
    width: '100%',
    gap: 12,
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
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  googleBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
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
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingVertical: 15,
    gap: 8,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#052e16',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
