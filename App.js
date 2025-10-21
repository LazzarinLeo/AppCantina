import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import SinginScreen from './screens/SingInScreen';
import { HomeScreen } from './screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
        <Stack.Screen name="Singin" component={SinginScreen} options={{ title: 'Cadastro' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Cantina Escolar' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}