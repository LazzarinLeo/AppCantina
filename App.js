import React, { useContext } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 🧩 Contextos globais
import { UserProvider, UserContext } from './contexts/UserContext';
import { WalletProvider } from './contexts/WalletContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// 🧭 Telas
import LoginScreen from './screens/LoginScreen';
import SinginScreen from './screens/SingInScreen';
import HomeScreen from './screens/HomeScreen';
import PerfilScreen from './screens/PerfilScreen';
import HistoricoScreen from './screens/HistoricoScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// 🔧 Rotas internas com suporte a tema e contexto do usuário
function AppRoutes() {
  const { user } = useContext(UserContext);
  const { theme } = useTheme();

  // Extensão do tema do React Navigation, sincronizado com o ThemeContext
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
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Singin"
              component={SinginScreen}
              options={{ title: 'Cadastro' }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Perfil"
              component={PerfilScreen}
              options={{ title: 'Perfil' }}
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
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </WalletProvider>
  );
}

// 🧠 App principal com todos os providers globais
export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </UserProvider>
  );
}
