import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, getApiErrorMessage, setApiToken } from '../api/client';
import { signOutFromFirebase } from '../config/firebase';

const AuthContext = createContext(null);
const TOKEN_KEY = 'produce-ordering-token';
const USER_KEY = 'produce-ordering-user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedToken) {
          setApiToken(storedToken);
          setToken(storedToken);
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const persistJwt = async (nextToken, nextUser = null) => {
    await AsyncStorage.setItem(TOKEN_KEY, nextToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser || null));
    setApiToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      await persistJwt(response.data.token, response.data.user || null);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to sign in.'));
    }
  };

  const register = async (payload) => {
    try {
      const response = await apiClient.post('/auth/register', payload);
      if (response.data?.token) {
        await persistJwt(response.data.token, response.data.user || null);
      }
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to register.'));
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const response = await apiClient.post('/auth/google', { idToken });
      await persistJwt(response.data.token, response.data.user || null);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to continue with Google.'));
    }
  };

  const logout = async () => {
    await signOutFromFirebase();
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setApiToken(null);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [token, user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
};
