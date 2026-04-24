import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, getApiErrorMessage, setApiToken } from '../api/client';
import { signOutFromFirebase } from '../config/firebase';

const AuthContext = createContext(null);
const TOKEN_KEY = 'produce-ordering-token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          setApiToken(storedToken);
          setToken(storedToken);
        }
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const persistJwt = async (nextToken) => {
    await AsyncStorage.setItem(TOKEN_KEY, nextToken);
    setApiToken(nextToken);
    setToken(nextToken);
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      await persistJwt(response.data.token);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to sign in.'));
    }
  };

  const register = async (payload) => {
    try {
      const response = await apiClient.post('/auth/register', payload);
      if (response.data?.token) {
        await persistJwt(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to register.'));
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const response = await apiClient.post('/auth/google', { idToken });
      await persistJwt(response.data.token);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to continue with Google.'));
    }
  };

  const logout = async () => {
    await signOutFromFirebase();
    await AsyncStorage.removeItem(TOKEN_KEY);
    setApiToken(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      authLoading,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [token, authLoading]
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
