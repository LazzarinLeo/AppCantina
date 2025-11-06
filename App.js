import React from 'react';
import LoginScreen from './screens/LoginScreen';
import SinginScreen from './screens/SingInScreen';
import HomeScreen from './screens/HomeScreen';
import PerfilScreen from './screens/PerfilScreen';
import HistoricoScreen from './screens/HistoricoScreen'; // ✅ import novo
import { UserProvider } from './contexts/UserContext';
import { WalletProvider } from './contexts/WalletContext';
import { CartProvider } from './contexts/CartContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <WalletProvider>
        <CartProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: 'Entrar', headerShown: false }}
              />
              <Stack.Screen
                name="Singin"
                component={SinginScreen}
                options={{ title: 'Cadastro' }}
              />
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Cantina Escolar', headerShown: false }}
              />
              <Stack.Screen
                name="Perfil"
                component={PerfilScreen}
                options={{ title: 'Meu Perfil' }}
              />
              <Stack.Screen
                name="Historico"
                component={HistoricoScreen}
                options={{ title: 'Histórico de Compras' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </CartProvider>
      </WalletProvider>
    </UserProvider>
  );
}
