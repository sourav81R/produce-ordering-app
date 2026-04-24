import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text } from 'react-native';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import LoginScreen from './src/screens/LoginScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';
import PlaceOrderScreen from './src/screens/PlaceOrderScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { theme } from './src/constants/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.primary,
  },
  headerTintColor: '#ffffff',
  headerTitleStyle: {
    fontWeight: '700',
  },
  contentStyle: {
    backgroundColor: theme.colors.background,
  },
};

function LoadingScreen() {
  return (
    <SafeAreaView style={styles.loadingScreen}>
      <StatusBar style="light" />
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Loading your session...</Text>
    </SafeAreaView>
  );
}

function MainTabs() {
  const { count } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#BDBDBD',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarBadge: route.name === 'Cart' && count > 0 ? count : undefined,
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
      <Tab.Screen name="Products" component={ProductListScreen} options={{ title: 'Browse Catalogue' }} />
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

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style={token ? 'light' : 'dark'} />
      {token ? (
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen
            name="GoVigi"
            component={MainTabs}
            options={{
              title: '🌿 GoVigi',
              headerRight: () => (
                <Pressable style={styles.headerIconButton} onPress={logout}>
                  <Ionicons name="log-out-outline" size={20} color="#ffffff" />
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
  headerIconButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
});
