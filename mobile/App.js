import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';
import PlaceOrderScreen from './src/screens/PlaceOrderScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { theme } from './src/constants/theme';

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

function PlaceOrderRoute({ navigation, route }) {
  return (
    <PlaceOrderScreen
      route={route}
      onOrderPlaced={() => navigation.navigate('My Orders')}
    />
  );
}

function MainTabs() {
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
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            'Browse Catalogue': {
              active: 'leaf',
              inactive: 'leaf-outline',
            },
            'Place Order': {
              active: 'cart',
              inactive: 'cart-outline',
            },
            'My Orders': {
              active: 'receipt',
              inactive: 'receipt-outline',
            },
          };

          const icons = iconMap[route.name];
          const active = color === theme.colors.primary;

          return (
            <Ionicons
              name={active ? icons.active : icons.inactive}
              color={color}
              size={size}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Browse Catalogue"
        component={ProductListScreen}
        options={{ title: 'Browse Catalogue' }}
      />
      <Tab.Screen name="Place Order" component={PlaceOrderRoute} />
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
            name="Catalogue"
            component={MainTabs}
            options={{
              title: '\uD83C\uDF3F GoVigi',
              headerRight: () => (
                <Pressable style={styles.headerIconButton} onPress={logout}>
                  <Ionicons name="log-out-outline" size={20} color="#ffffff" />
                </Pressable>
              ),
            }}
          />
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
      <AppShell />
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
