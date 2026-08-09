import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { ToastProvider } from './context/ToastContext';
import { usePushNotifications } from './hooks/usePushNotifications';
import client from './services/client';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import RoomScreen from './screens/RoomScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const { expoPushToken } = usePushNotifications();
  const notificationResponseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    const syncPushToken = async () => {
      if (!expoPushToken) return;
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          await client.post('/api/auth/save-token', { token: expoPushToken });
        }
      } catch (e) {
        console.error('Failed to sync push token:', e);
      }
    };
    syncPushToken();
  }, [expoPushToken]);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setInitialRoute(token ? 'Room' : 'Welcome');
      } catch {
        setInitialRoute('Welcome');
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.roomId && data?.roomTitle && navigationRef.isReady()) {
        (navigationRef as any).navigate('Chat', { roomId: data.roomId, roomTitle: data.roomTitle });
      }
    });
    return () => { notificationResponseListener.current?.remove(); };
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0b0a10', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='#22c55e' />
      </View>
    );
  }

  return (
    <ToastProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0b0a10' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name='Welcome' component={WelcomeScreen} />
          <Stack.Screen name='Login' component={LoginScreen} />
          <Stack.Screen name='Signup' component={SignupScreen} />
          <Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen} />
          <Stack.Screen name='Room' component={RoomScreen} />
          <Stack.Screen name='Chat' component={ChatScreen} />
          <Stack.Screen name='Profile' component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
  );
}
