import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import LoginScreen from './src/screens/LoginScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';
import PlaceOrderScreen from './src/screens/PlaceOrderScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoadingState from './src/components/LoadingState';
import { theme } from './src/constants/theme';
import { useAppUpdates } from './src/hooks/useAppUpdates';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
    notification: theme.colors.cta,
  },
};

const screenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.surface,
  },
  headerShadowVisible: false,
  headerTintColor: theme.colors.text,
  headerTitleStyle: {
    fontWeight: '800',
    fontSize: 18,
  },
  contentStyle: {
    backgroundColor: theme.colors.background,
  },
};

function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <StatusBar style="dark" />
      <View style={styles.loadingBadge}>
        <Ionicons name="leaf" size={18} color={theme.colors.primary} />
        <Text style={styles.loadingBadgeText}>GoVigi</Text>
      </View>
      <LoadingState label="Restoring your session..." />
    </View>
  );
}

function MainTabs() {
  const { count } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.subtle,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarBadge: route.name === 'Cart' && count > 0 ? count : undefined,
        tabBarBadgeStyle: styles.tabBarBadge,
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap = {
            Products: focused ? 'leaf' : 'leaf-outline',
            Cart: focused ? 'cart' : 'cart-outline',
            Favorites: focused ? 'heart' : 'heart-outline',
            'My Orders': focused ? 'receipt' : 'receipt-outline',
          };

          return <Ionicons name={iconMap[route.name]} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Products" component={ProductListScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="My Orders" component={MyOrdersScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppShell() {
  const { token, authLoading, logout } = useAuth();
  const {
    enabled: updatesEnabled,
    error: updateError,
    isChecking,
    isDownloading,
    isApplying,
    isReadyToApply,
  } = useAppUpdates();

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.appContainer}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="dark" />
        {token ? (
          <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen
              name="Home"
              component={MainTabs}
              options={{
                title: 'GoVigi Fresh',
                headerLeft: () => (
                  <View style={styles.brandMark}>
                    <Ionicons name="leaf" size={18} color={theme.colors.white} />
                  </View>
                ),
                headerRight: () => (
                  <Pressable style={styles.headerIconButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color={theme.colors.text} />
                  </Pressable>
                ),
              }}
            />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Place Order" component={PlaceOrderScreen} />
          </Stack.Navigator>
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>

      {updatesEnabled && (isChecking || isDownloading || isApplying || updateError || isReadyToApply) ? (
        <View style={styles.updateBanner}>
          <Ionicons
            name={
              updateError
                ? 'alert-circle-outline'
                : isApplying
                  ? 'sync-outline'
                  : isReadyToApply
                    ? 'checkmark-circle-outline'
                    : 'cloud-download-outline'
            }
            size={16}
            color={
              updateError
                ? theme.colors.danger
                : isReadyToApply || isApplying
                  ? theme.colors.success
                  : theme.colors.primaryDark
            }
          />
          <Text
            style={[
              styles.updateBannerText,
              updateError && { color: theme.colors.danger },
            ]}
          >
            {updateError
              ? updateError
              : isApplying
                ? 'Applying the latest update now...'
                : isReadyToApply
                  ? 'Latest update downloaded. Restarting into the new version...'
                  : isChecking
                    ? 'Checking for updates...'
                    : 'Downloading update in the background...'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  loadingBadge: {
    position: 'absolute',
    top: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadingBadgeText: {
    color: theme.colors.primaryDark,
    fontWeight: '800',
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryDark,
    marginRight: 10,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8D6',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabBar: {
    display: Platform.OS === 'web' ? 'none' : 'flex',
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopColor: 'transparent',
    height: 78,
    paddingTop: 10,
    paddingBottom: 12,
    borderRadius: 24,
    ...theme.shadows.card,
  },
  tabBarItem: {
    borderRadius: 18,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabBarBadge: {
    backgroundColor: theme.colors.primaryDark,
    color: theme.colors.white,
    fontWeight: '700',
  },
  updateBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  updateBannerText: {
    flex: 1,
    color: theme.colors.primaryDark,
    fontWeight: '600',
    lineHeight: 20,
  },
});
