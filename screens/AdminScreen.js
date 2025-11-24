import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../Services/supabase';

export default function AdminScreen() {
  const { theme } = useTheme();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');

  async function fetchUsuarios() {
    setLoading(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      Alert.alert('Erro ao buscar usuários', error.message);
    } else {
      setUsuarios(data);
    }
    setLoading(false);
  }
//Não funciona ainda MEXER DPS
  async function excluirUsuario(id) {
    Alert.alert(
      'Confirmação',
      'Deseja realmente excluir este usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('usuarios').delete().eq('id', id);
            if (error) {
              Alert.alert('Erro ao excluir usuário', error.message);
            } else {
              Alert.alert('Usuário excluído com sucesso');
              fetchUsuarios();
            }
          },
        },
      ]
    );
  }


  function abrirModalEdicao(usuario) {
    setUsuarioAtual(usuario);
    setNovoNome(usuario.nome);
    setNovoEmail(usuario.email);
    setModalVisible(true);
  }

  async function salvarEdicao() {
    if (!novoNome || !novoEmail) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ nome: novoNome, email: novoEmail })
        .eq('id', usuarioAtual.id);

      if (error) {
        Alert.alert('Erro ao atualizar usuário', error.message);
        return;
      }

      Alert.alert('Usuário atualizado com sucesso!');
      setModalVisible(false);
      fetchUsuarios();
    } catch (err) {
      Alert.alert('Erro inesperado', err.message);
    }
  }

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Painel do Administrador</Text>

      {loading ? (
        <Text style={{ color: theme.colors.text }}>Carregando usuários...</Text>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.userCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.userText, { color: theme.colors.text }]}>
                {item.nome} ({item.email}) {item.admin ? ' - Admin' : ''}
              </Text>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#3498db' }]}
                  onPress={() => abrirModalEdicao(item)}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#e74c3c' }]}
                  onPress={() => excluirUsuario(item.id)}
                >
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Editar Usuário</Text>

            <TextInput
              placeholder="Nome"
              value={novoNome}
              onChangeText={setNovoNome}
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
              placeholderTextColor={theme.colors.placeholder}
            />

            <TextInput
              placeholder="Email"
              value={novoEmail}
              onChangeText={setNovoEmail}
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
              placeholderTextColor={theme.colors.placeholder}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#27ae60' }]}
                onPress={salvarEdicao}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#e74c3c' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  userCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  userText: { fontSize: 16, marginBottom: 10 },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
