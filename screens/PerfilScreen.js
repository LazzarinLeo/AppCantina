import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
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
      <View style={styles.header}>
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
      <View style={styles.history}>
        <Text style={styles.texthist}>Histórico de Compras:</Text>
        <FlatList>

        </FlatList>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    marginTop: 40,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20
  },
  history:{
    marginTop: 10,
    backgroundColor:'#fff',
    paddingHorizontal: 65,
    borderRadius: 20
  },
  texthist:{
    fontWeight:"bold",
    fontSize:20,
    color: '#6D4C41',
  }
});
