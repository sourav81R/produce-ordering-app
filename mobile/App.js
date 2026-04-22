import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import PlaceOrderScreen from './src/screens/PlaceOrderScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { theme } from './src/constants/theme';

const authTabs = [
  { key: 'login', label: 'Login' },
  { key: 'register', label: 'Register' },
];

const appTabs = [
  { key: 'products', label: 'Products' },
  { key: 'place-order', label: 'Place Order' },
  { key: 'orders', label: 'My Orders' },
];

function AppShell() {
  const { token, authLoading, logout } = useAuth();
  const [activeAuthTab, setActiveAuthTab] = useState('login');
  const [activeAppTab, setActiveAppTab] = useState('products');
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);

  if (authLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your session...</Text>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.authContainer}>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Produce Ordering App</Text>
            <Text style={styles.heroSubtitle}>
              Sign in to order produce, choose delivery dates, and monitor your order status.
            </Text>
          </View>

          <View style={styles.tabRow}>
            {authTabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, activeAuthTab === tab.key && styles.activeTabButton]}
                onPress={() => setActiveAuthTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeAuthTab === tab.key && styles.activeTabLabel,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeAuthTab === 'login' ? (
            <LoginScreen onSwitchMode={setActiveAuthTab} />
          ) : (
            <RegisterScreen onSwitchMode={setActiveAuthTab} />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.appTitle}>Produce Ordering App</Text>
          <Text style={styles.appSubtitle}>Manage products and produce deliveries.</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {appTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeAppTab === tab.key && styles.activeTabButton]}
            onPress={() => setActiveAppTab(tab.key)}
          >
            <Text style={[styles.tabLabel, activeAppTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.screenContainer}>
        {activeAppTab === 'products' ? <ProductListScreen /> : null}
        {activeAppTab === 'place-order' ? (
          <PlaceOrderScreen
            onOrderPlaced={() => {
              setOrdersRefreshKey((current) => current + 1);
              setActiveAppTab('orders');
            }}
          />
        ) : null}
        {activeAppTab === 'orders' ? <OrdersScreen refreshKey={ordersRefreshKey} /> : null}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    gap: 12,
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 16,
  },
  authContainer: {
    padding: 20,
    gap: 18,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.muted,
  },
  appHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  appSubtitle: {
    marginTop: 4,
    color: theme.colors.muted,
  },
  logoutButton: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoutLabel: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  tabButton: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
  },
  tabLabel: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#ffffff',
  },
  screenContainer: {
    flex: 1,
    padding: 20,
  },
});

