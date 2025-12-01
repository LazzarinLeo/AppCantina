import React, { useCallback, useContext } from 'react';
import { BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useFocusEffect,
} from '@react-navigation/native';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 🧩 Contextos globais
import { UserProvider, UserContext } from './contexts/UserContext';
import { WalletProvider } from './contexts/WalletContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// 🧭 Telas
import LoginScreen from './screens/LoginScreen';
import SinginScreen from './screens/SingInScreen';
import ProdutosScreen from './screens/ProdutosScreen';
import PerfilScreen from './screens/PerfilScreen';
import HistoricoScreen from './screens/HistoricoScreen';
import SettingsScreen from './screens/SettingsScreen';
import CarteiraScreen from './screens/CarteiraScreen';
import CarrinhoScreen from './screens/CarrinhoScreen';
import ScannerScreen from './screens/ScannerScreen';
import HomePerfilScreen from './screens/PerfilScreen';
import AdminScreen from './screens/AdminScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ProdutosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProdutosMain"
        component={ProdutosScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Carrinho"
        component={CarrinhoScreen}
        options={{ title: 'Carrinho' }}
      />
    </Stack.Navigator>
  );
}

function HomeScreen() {
  const { theme } = useTheme();


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => backHandler.remove();
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor:
            theme.mode === 'dark' ? '#1C1C1E' : theme.colors.tabBarBackground,
          borderTopWidth: 0,
          elevation: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Produtos') iconName = 'fast-food';
          else if (route.name === 'Perfil') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Produtos" component={ProdutosStack} />
      <Tab.Screen name="Perfil" component={HomePerfilScreen} />
    </Tab.Navigator>
  );
}

function AppRoutes() {
  const { user } = useContext(UserContext);
  const { theme } = useTheme();

  const navigationTheme =
    theme.mode === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: theme.colors.background,
            card: theme.colors.card,
            text: theme.colors.text,
            primary: theme.colors.button,
            border: theme.colors.border,
            notification: theme.colors.highlight,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.colors.background,
            card: theme.colors.card,
            text: theme.colors.text,
            primary: theme.colors.button,
            border: theme.colors.border,
            notification: theme.colors.highlight,
          },
        };

  return (
    <WalletProvider usuarioId={user?.id}>
      <CartProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Signin"
                component={SinginScreen}
                options={{ title: 'Cadastro' }}
              />
              <Stack.Screen
                name="Admin"
                component={AdminScreen}
                options={{ title: 'Painel de Admin' }}
              />

              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Historico"
                component={HistoricoScreen}
                options={{ title: 'Histórico de Compras' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Configurações' }}
              />
              <Stack.Screen
                name="Carteira"
                component={CarteiraScreen}
                options={{ title: 'Minha Carteira' }}
              />
              <Stack.Screen
                name="Carrinho"
                component={CarrinhoScreen}
                options={{ title: 'Carrinho' }}
              />
              <Stack.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{ title: 'Scanner QR' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </CartProvider>
    </WalletProvider>
  );
}

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppRoutes />
        </SafeAreaProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
