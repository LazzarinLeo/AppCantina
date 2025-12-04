// Tela do administrador: permite editar os dados dos usuários

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import { useTheme } from '../contexts/ThemeContext'; // Tema escuro/claro
import { supabase } from '../Services/supabase'; // Conexão com o banco
import { UserContext } from '../contexts/UserContext'; // Usuário logado

export default function AdminScreen() {

  const { theme } = useTheme();
  const { user, logout } = useContext(UserContext);

  const [usuarios, setUsuarios] = useState([]); // Lista de usuários
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false); // Modal de edição
  const [usuarioAtual, setUsuarioAtual] = useState(null); // Usuário sendo editado

  // Estados para edição
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [novaTurma, setNovaTurma] = useState('');

  // Busca todos os usuários no Supabase
  async function fetchUsuarios() {
    setLoading(true);

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('turma', { ascending: true }) // Ordena por turma
      .order('id', { ascending: true }); // Depois por ID

    if (error) {
      Alert.alert('Erro ao buscar usuários', error.message);
    } else {
      setUsuarios(data);
    }

    setLoading(false);
  }

  // Abre o modal para editar um usuário
  function abrirModalEdicao(usuario) {
    if (usuario.admin) {
      Alert.alert('Aviso', 'Não é possível editar usuários administradores!');
      return;
    }

    // Preenche campos com os dados atuais
    setUsuarioAtual(usuario);
    setNovoNome(usuario.nome);
    setNovoEmail(usuario.email);
    setAtivo(usuario.ativo);
    setNovaTurma(usuario.turma || '');
    setModalVisible(true);
  }

  // Salva alterações do usuário no Supabase
  async function salvarEdicao() {
    if (!novoNome || !novoEmail || !novaTurma) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: novoNome,
          email: novoEmail,
          ativo: ativo,
          turma: novaTurma.toUpperCase()
        })
        .eq('id', usuarioAtual.id);

      if (error) {
        Alert.alert('Erro ao atualizar usuário', error.message);
        return;
      }

      Alert.alert('Usuário atualizado com sucesso!');
      setModalVisible(false);

      // Recarrega lista
      fetchUsuarios();

      // Se desativou a própria conta → desloga
      if (usuarioAtual.id === user.id && !ativo) {
        Alert.alert('Você foi desativado', 'Sua conta foi desativada pelo administrador.');
        logout();
      }

    } catch (err) {
      Alert.alert('Erro inesperado', err.message);
    }
  }

  // Cria grupos agrupando usuários por turma
  const gruposPorTurma = usuarios.reduce((acc, u) => {
    const turma = u.turma || 'Sem turma';
    if (!acc[turma]) acc[turma] = [];
    acc[turma].push(u);
    return acc;
  }, {});

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Painel do Administrador</Text>

      {loading ? (
        <Text style={{ color: theme.colors.text }}>Carregando usuários...</Text>
      ) : (

        // Exibe cada grupo de turma
        Object.keys(gruposPorTurma).map((turma) => (
          <View key={turma} style={{ marginBottom: 20 }}>
            <Text style={[styles.turmaTitle, { color: theme.colors.text }]}>
              Turma: {turma}
            </Text>

            {/* Usuários dentro da turma */}
            {gruposPorTurma[turma].map((item) => (
              <View
                key={item.id}
                style={[styles.userCard, { backgroundColor: theme.colors.card }]}
              >
                <Text style={[styles.userText, { color: theme.colors.text }]}>
                  {item.nome} ({item.email})
                  {item.admin ? ' - Admin' : ''}
                  {item.ativo ? ' - Ativo' : ' - Desativado'}
                </Text>

                {/* Botão editar */}
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#3498db' }]}
                    onPress={() => abrirModalEdicao(item)}
                    disabled={item.admin} // Admin não pode ser editado
                  >
                    <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))
      )}

      {/* Modal de edição */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <ScrollView
            contentContainerStyle={[
              styles.modalContent,
              { backgroundColor: theme.colors.background }
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Editar Usuário
            </Text>

            {/* Input nome */}
            <TextInput
              placeholder="Nome"
              value={novoNome}
              onChangeText={setNovoNome}
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
              placeholderTextColor={theme.colors.placeholder}
            />

            {/* Input email */}
            <TextInput
              placeholder="Email"
              value={novoEmail}
              onChangeText={setNovoEmail}
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
              placeholderTextColor={theme.colors.placeholder}
            />

            {/* Input turma */}
            <TextInput
              placeholder="Turma"
              value={novaTurma}
              onChangeText={setNovaTurma}
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
              placeholderTextColor={theme.colors.placeholder}
            />

            {/* Switch ativo/desativo */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, marginRight: 10 }}>
                Usuário Desativado:
              </Text>
              <Switch
                value={ativo}
                onValueChange={setAtivo}
                trackColor={{ true: '#27ae60', false: '#e74c3c' }}
                thumbColor="#fff"
              />
            </View>

            {/* Botões */}
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
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  turmaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  userCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2
  },
  userText: {
    fontSize: 16,
    marginBottom: 10
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20
  },
  modalContent: {
    borderRadius: 8,
    padding: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  input: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    fontSize: 16
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
});
