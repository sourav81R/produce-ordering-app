import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import UpdatePrompt from './src/components/UpdatePrompt';
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
    isPromptVisible,
    applyUpdate,
    dismissUpdate,
    reopenUpdatePrompt,
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
                title: 'GoVigi Produce',
                headerLeft: () => (
                  <View style={styles.brandMark}>
                    <Ionicons name="leaf" size={18} color={theme.colors.primary} />
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

      {updatesEnabled && (isChecking || isDownloading || updateError || (isReadyToApply && !isPromptVisible)) ? (
        <Pressable
          disabled={!(isReadyToApply && !isPromptVisible)}
          onPress={reopenUpdatePrompt}
          style={styles.updateBanner}
        >
          <Ionicons
            name={
              updateError
                ? 'alert-circle-outline'
                : isReadyToApply && !isPromptVisible
                  ? 'checkmark-circle-outline'
                  : 'cloud-download-outline'
            }
            size={16}
            color={
              updateError
                ? theme.colors.danger
                : isReadyToApply && !isPromptVisible
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
              : isReadyToApply && !isPromptVisible
                ? 'A new update is ready. Tap here to install it now.'
              : isChecking
                ? 'Checking for updates...'
                : 'Downloading update in the background...'}
          </Text>
        </Pressable>
      ) : null}

      <UpdatePrompt
        visible={updatesEnabled && isReadyToApply && isPromptVisible}
        loading={isApplying}
        onApply={applyUpdate}
        onLater={dismissUpdate}
      />
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
    marginRight: 10,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    height: 72,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabBarBadge: {
    backgroundColor: theme.colors.cta,
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
