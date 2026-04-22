import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
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

function PlaceOrderRoute({ navigation }) {
  return <PlaceOrderScreen onOrderPlaced={() => navigation.navigate('My Orders')} />;
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
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Products: 'sprout',
            'Place Order': 'cart-outline',
            'My Orders': 'clipboard-text-outline',
          };

          return <MaterialCommunityIcons name={iconMap[route.name]} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen
        name="Products"
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
              headerRight: () => (
                <View style={styles.headerButtonWrap}>
                  <Text style={styles.headerButtonText} onPress={logout}>
                    Logout
                  </Text>
                </View>
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
  headerButtonWrap: {
    paddingHorizontal: 4,
  },
  headerButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
