import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; // Ícones do Expo

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
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim',
        onPress: () => {
          logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const goToHistorico = () => {
    navigation.navigate('Historico');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBackground} />

      <View style={styles.profileCard}>
        {/* Imagem ou Ícone de Perfil */}
        <View style={styles.imageContainer}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.profileImage} />
          ) : (
            <MaterialIcons name="account-circle" size={110} color="#FFB300" />
          )}
        </View>

        {/* Dados do Usuário */}
        <Text style={styles.title}>Perfil do Usuário</Text>

        {user ? (
          <>
            <Text style={styles.nome}>{user.nome}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </>
        ) : (
          <Text style={styles.nome}>Carregando...</Text>
        )}

        {/* Botões */}
        <TouchableOpacity style={styles.historyButton} onPress={goToHistorico}>
          <FontAwesome5 name="receipt" size={18} color="#4E342E" />
          <Text style={styles.historyText}> Ver Histórico de Compras</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#FFF" />
          <Text style={styles.logoutText}> Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  headerBackground: {
    backgroundColor: '#FFD54F',
    height: 220,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 100,
    marginHorizontal: 20,
  },
  imageContainer: {
    borderWidth: 3,
    borderColor: '#FFB300',
    borderRadius: 75,
    padding: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 10,
  },
  nome: {
    fontSize: 18,
    color: '#5D4037',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#8D6E63',
    marginBottom: 25,
  },
  historyButton: {
    flexDirection: 'row',
    backgroundColor: '#FFB74D',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyText: {
    color: '#4E342E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
