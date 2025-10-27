<<<<<<< HEAD

import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, SafeAreaView, Image } from 'react-native';
import { supabase } from '../Services/supabase';
import produtosData from '../Services/Mock.json';
=======
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProdutosScreen from '../screens/ProdutosScreen';
import PerfilScreen from '../screens/PerfilScreen';
>>>>>>> 0a6c06fcd4839877d2ebb344e13ae19ddab4ba9d

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#009688',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
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
      <Tab.Screen name="Produtos" component={ProdutosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
<<<<<<< HEAD
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcome: {
    fontSize: 20,
    color: '#6D4C41',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  imagem: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  info: {
    marginLeft: 15,
    flex: 1,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6D4C41',
  },
  preco: {
    fontSize: 16,
    color: '#FFA726',
    marginTop: 4,
  },
});

=======
}
>>>>>>> 0a6c06fcd4839877d2ebb344e13ae19ddab4ba9d
