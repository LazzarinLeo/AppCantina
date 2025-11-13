import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

import ProdutosScreen from '../screens/ProdutosScreen';
import CarrinhoScreen from './CarrinhoScreen';
import PerfilScreen from './PerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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

export default function HomeScreen() {
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
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
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
