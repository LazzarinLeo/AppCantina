import React, { useContext } from 'react';
import { UserProvider, UserContext } from './contexts/UserContext';
import { WalletProvider } from './contexts/WalletContext';
import { CartProvider } from './contexts/CartContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import SinginScreen from './screens/SingInScreen';
import HomeScreen from './screens/HomeScreen';
import PerfilScreen from './screens/PerfilScreen';
import HistoricoScreen from './screens/HistoricoScreen';

const Stack = createNativeStackNavigator();

function AppRoute() {
  const { user } = useContext(UserContext);

  return (
    <WalletProvider usuarioId={user?.id}>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Singin" component={SinginScreen} />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Perfil" component={PerfilScreen} />
            <Stack.Screen name="Historico" component={HistoricoScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </WalletProvider>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppRoute />
    </UserProvider>
  );
}
