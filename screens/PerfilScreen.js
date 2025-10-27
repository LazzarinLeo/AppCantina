import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useUser } from '../contexts/UserContext';

export default function PerfilScreen({ navigation }) {
  const { user, logout } = useUser();

  useEffect(() => {
    if (!user) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim', 
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Perfil do Usuário</Text>

      {user ? (
        <>
          <Text style={styles.nome}>Bem-vindo, {user.nome}!</Text>
          <Text style={styles.email}>{user.email}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.nome}>Carregando...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#FFF8E1' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#6D4C41', 
    marginBottom: 15 
  },
  nome: { 
    fontSize: 18, 
    color: '#5D4037', 
    marginBottom: 5 
  },
  email: { 
    fontSize: 16, 
    color: '#8D6E63', 
    marginBottom: 25 
  },
  logoutButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
