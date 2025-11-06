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
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../Services/supabase';

export default function PerfilScreen({ navigation }) {
  const { user, logout, setUser } = useUser();

  useEffect(() => {
    if (!user) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim',
        onPress: () => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const goToHistorico = () => {
    navigation.navigate('Historico');
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permissão negada', 'Você precisa permitir o acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      uploadImageToSupabase(image.uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permissão negada', 'Você precisa permitir o acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      uploadImageToSupabase(image.uri);
    }
  };

  const uploadImageToSupabase = async (uri) => {
    try {
      const fileExt = uri.split('.').pop().toLowerCase();
      const mimeType = fileExt === 'png' ? 'image/png' : 'image/jpeg';
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;
      await updateUserAvatar(avatarUrl);
    } catch (error) {
      console.error('Erro ao fazer upload:', error.message);
    }
  };

  const updateUserAvatar = async (avatarUrl) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ avatar: avatarUrl })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, avatar: avatarUrl });
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBackground} />

      <View style={styles.profileCard}>
        <View style={styles.imageContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.profileImage} resizeMode="cover" />
          ) : (
            <MaterialIcons name="account-circle" size={110} color="#FFB300" />
          )}
        </View>

        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.actionText}>Alterar Foto de Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={takePhoto}>
          <Text style={styles.actionText}>Tirar Foto</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Perfil do Usuário</Text>

        {user ? (
          <>
            <Text style={styles.nome}>{user.nome}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </>
        ) : (
          <Text style={styles.nome}>Carregando...</Text>
        )}

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
  container: { flex: 1, backgroundColor: '#ffe8e0' },
  headerBackground: {
    backgroundColor: '#FF7043',
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
    borderColor: '#FF7043',
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
  actionText: {
    color: '#FF7043',
    marginBottom: 15,
    fontWeight: 'bold',
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
    backgroundColor:'#fa9778',
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
