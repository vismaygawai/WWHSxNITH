import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
  ActivityIndicator,
  BackHandler,
  Platform,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';

const WEBSITE_URL = 'https://wwhs.vismay.dev';

// Custom Mobile User Agent so Google OAuth and third-party Web APIs work seamlessly without blocks
const CUSTOM_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Mobile; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

export default function App() {
  const webViewRef = useRef<any>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Handle Android physical back button for web view history navigation
  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }
  }, [canGoBack]);

  const handleReload = () => {
    setHasError(false);
    if (Platform.OS === 'web') {
      const doc = (globalThis as any).document;
      if (doc) {
        const iframe = doc.getElementById('wwhs-iframe');
        if (iframe) iframe.src = WEBSITE_URL;
      }
    } else {
      webViewRef.current?.reload();
    }
  };

  // Web Browser Platform Fallback Render
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0a10" />
        <iframe
          id="wwhs-iframe"
          src={WEBSITE_URL}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#0b0a10',
          }}
          title="WWHS? x NITH"
          allow="camera; microphone; geolocation"
        />
      </View>
    );
  }

  // Native iOS / Android Mobile Render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0a10" />

      <WebView
        ref={webViewRef}
        source={{ uri: WEBSITE_URL }}
        userAgent={CUSTOM_USER_AGENT}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState={true}
        androidLayerType="hardware"
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures={true}
        overScrollMode="never"
        onNavigationStateChange={(navState: any) => {
          setCanGoBack(navState.canGoBack);
        }}
        onLoadStart={() => {
          setHasError(false);
        }}
        onError={() => {
          setHasError(true);
        }}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <Image source={require('./assets/icon.png')} style={styles.splashLogo} />
            <Text style={styles.brandTitle}>WWHS? x NITH</Text>
            <ActivityIndicator size="large" color="#22c55e" style={{ marginTop: 20 }} />
          </View>
        )}
      />

      {hasError && (
        <View style={styles.errorOverlay}>
          <Image source={require('./assets/icon.png')} style={styles.errorLogo} />
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorText}>
            Unable to connect to WWHS? x NITH servers. Please check your internet connection.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleReload} activeOpacity={0.88}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0a10',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0b0a10',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0b0a10',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  splashLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 16,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0b0a10',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 20,
  },
  errorLogo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 9999,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  retryText: {
    color: '#052e16',
    fontSize: 15,
    fontWeight: '800',
  },
});
