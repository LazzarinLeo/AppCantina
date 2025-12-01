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
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../Services/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function PerfilScreen({ navigation }) {
  const { user, logout, setUser } = useUser();
  const { theme } = useTheme();

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

  const goToHistorico = () => navigation.navigate('Historico');
  const goToSettings = () => navigation.navigate('Settings');

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
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
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
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
      const ext = uri.split('.').pop().toLowerCase();
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

      // Deleta avatar antigo, se houver
      if (user?.avatar) {
        const oldFileName = user.avatar.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('avatars').remove([oldFileName]);
        }
      }

      // Gera novo nome incremental
      let fileNumber = 1;
      let filePath = `avatars/${user.id}.${fileNumber}.${ext}`;

      // Checa se já existe (precaução)
      while (true) {
        const { data: existingFile } = await supabase.storage
          .from('avatars')
          .list('', { search: `${user.id}.${fileNumber}.${ext}` });

        if (existingFile.length === 0) break;
        fileNumber++;
        filePath = `avatars/${user.id}.${fileNumber}.${ext}`;
      }

      // Upload
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: mime,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      await updateUserAvatar(avatarUrl);
    } catch (error) {
      console.error('Erro no upload:', error.message);
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
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.mode === 'dark' ? '#1a1a1a' : '#ffe8e0' },
      ]}
    >
      <View
        style={[
          styles.headerBackground,
          { backgroundColor: theme.mode === 'dark' ? '#333' : '#FF7043' },
        ]}
      />

      <View
        style={[
          styles.profileCard,
          { backgroundColor: theme.mode === 'dark' ? '#2b2b2b' : '#fff' },
        ]}
      >
        <View style={[styles.imageContainer, theme.mode === 'dark' ? {borderColor:'#3220d0'} : {borderColor:'#FF7043'}]}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={[styles.profileImage]} resizeMode="cover" />
          ) : (
            <MaterialIcons
              name="account-circle"
              size={110}
              color={theme.mode === 'dark' ? '#703dff' : '#FFB300'}
            />
          )}
        </View>

        <TouchableOpacity onPress={pickImage}>
          <Text
            style={[
              styles.actionText,
              { color: theme.mode === 'dark' ? '#8a61ff' : '#FF7043' },
            ]}
          >
            Alterar Foto de Perfil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={takePhoto}>
          <Text
            style={[
              styles.actionText,
              { color: theme.mode === 'dark' ? '#8a61ff' : '#FF7043' },
            ]}
          >
            Tirar Foto
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.title,
            { color: theme.mode === 'dark' ? '#fff' : '#6D4C41' },
          ]}
        >
          Perfil do Usuário
        </Text>

        {user ? (
          <>
            <Text style={[styles.nome, { color: theme.mode === 'dark' ? '#fff' : '#5D4037' }]}>
              {user.nome}
            </Text>
            <Text style={[styles.email, { color: theme.mode === 'dark' ? '#ddd' : '#8D6E63' }]}>
              {user.email}
            </Text>
          </>
        ) : (
          <Text style={[styles.nome, { color: theme.mode === 'dark' ? '#fff' : '#5D4037' }]}>
            Carregando...
          </Text>
        )}
        <TouchableOpacity
          style={[styles.walletButton, theme.mode === 'dark' ? {backgroundColor:'#2a7cee'} : {backgroundColor:'#FFD8A6'}]}
          onPress={() => navigation.navigate('Carteira')}
        >
          <Ionicons name="wallet" size={20} color={theme.mode === 'dark' ? '#daead7': '#4E342E'} />
          <Text style={[styles.walletText, theme.mode === 'dark' ? {color:'#daead7'} : {color:'#4E342E'}]}> Adicionar Saldo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.historyButton, theme.mode === 'dark' ? {backgroundColor:'#5459ce'} : {backgroundColor:'#fa9778'}]} onPress={goToHistorico}>
          <FontAwesome5 name="receipt" size={18} color={theme.mode === 'dark' ? '#daead7': '#4E342E'} />
          <Text style={[styles.historyText, theme.mode === 'dark' ? {color:'#daead7'} : {color:'#4E342E'}]}> Ver Histórico de Compras</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingsButton, theme.mode === 'dark' ? {backgroundColor:'#2a7cee'} : {backgroundColor:'#FFD8A6'}]} onPress={goToSettings}>
          <Ionicons name="settings" size={20} color={theme.mode === 'dark' ? '#daead7': '#4E342E'} />
          <Text style={[styles.settingsText, theme.mode === 'dark' ? {color:'#daead7'} : {color:'#4E342E'}]}> Configurações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#FFF" />
          <Text style={[styles.logoutText]}> Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBackground: {
    height: 220,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  profileCard: {
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
    marginBottom: 15,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nome: {
    fontSize: 18,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    marginBottom: 25,
  },
  walletButton: {
    flexDirection: 'row',
    backgroundColor: '#FFD8A6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletText: {
    color: '#4E342E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyButton: {
    flexDirection: 'row',
    backgroundColor: '#fa9778',
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
  settingsButton: {
    flexDirection: 'row',
    backgroundColor: '#FFCC80',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
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
