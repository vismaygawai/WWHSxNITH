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
import { useToast } from '../context/ToastContext';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: Props) {
  const { showToast } = useToast();

  const handleGooglePress = () => {
    showToast('Redirecting to Google Authentication...', 'info');
    // Navigates to Login with auto-trigger or handles web OAuth flow
    navigation.navigate('Login', { google: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0a10" />
      
      {/* Ambient Dark Veiled Gradient Backgrounds */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <LinearGradient
          colors={['#0b0a10', '#0f0e18', '#07060c']}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.15)', 'transparent', 'rgba(16, 185, 129, 0.05)']}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.8, y: 0.9 }}
          style={styles.glowOverlay}
        />
        <View style={styles.topRadialGlow} />
      </View>

      <View style={styles.content}>
        {/* Brand Header Badge */}
        <View style={styles.badgeWrapper}>
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.05)']}
            style={styles.logoBadge}
          >
            <Text style={styles.logoText}>W</Text>
          </LinearGradient>
        </View>

        <Text style={styles.brandTitle}>WWHS? x NITH</Text>

        <Text style={styles.heroHeading}>
          The perfect group{'\n'}
          <Text style={styles.emeraldHighlight}>icon doesn't exi........</Text>
        </Text>

        <Text style={styles.subtitle}>
          A members-only live chat community for NITH tech enthusiasts.
        </Text>

        {/* Buttons Section */}
        <View style={styles.actionContainer}>
          {/* Continue with Google */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.googleButton}
            onPress={handleGooglePress}
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

          {/* Primary Sign Up */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButtonContent}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={18} color="#052e16" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Log In */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>Log In</Text>
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
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topRadialGlow: {
    position: 'absolute',
    top: -100,
    alignSelf: 'center',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    opacity: 0.6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  badgeWrapper: {
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  brandTitle: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 16,
  },
  heroHeading: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 38,
  },
  emeraldHighlight: {
    color: '#4ade80',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    maxWidth: 320,
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 9999,
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 12,
  },
  googleIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconLetter: {
    color: '#4285F4',
    fontSize: 13,
    fontWeight: '900',
  },
  googleButtonText: {
    color: '#ffffff',
    fontSize: 15,
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
    fontSize: 11,
    fontWeight: '700',
  },
  primaryButton: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  gradientButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryButtonText: {
    color: '#052e16',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: 'rgba(15, 14, 22, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.90)',
    fontSize: 15,
    fontWeight: '700',
  },
});
