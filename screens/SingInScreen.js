import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, FlatList, StyleSheet } from 'react-native';
import { supabase } from './Services/supabase';

export default function SinginScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  async function cadastrarUsuario() {
    if (!nome || !email || !senha) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    const { data: existingUser, error: errorCheck } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email);

    if (errorCheck) {
      Alert.alert('Erro ao verificar usuário', errorCheck.message);
      return;
    }

    if (existingUser.length > 0) {
      Alert.alert('Email já cadastrado!');
      return;
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nome, email, senha }]);

    if (error) {
      Alert.alert('Erro ao cadastrar', error.message);
    } else {
      Alert.alert('Usuário cadastrado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      buscarUsuarios();
    }
  }

  async function buscarUsuarios() {
    const { data, error } = await supabase.from('usuarios').select('*').order('nome');
    if (error) {
      Alert.alert('Erro ao buscar usuários', error.message);
    } else {
      setUsuarios(data);
    }
  }

  useEffect(() => {
    buscarUsuarios();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Usuário</Text>

      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      <Button title="Cadastrar" onPress={cadastrarUsuario} />

      <Text style={styles.subtitle}>Usuários cadastrados:</Text>

      <FlatList
        data={usuarios}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.usuarioItem}>
            <Text>{item.nome} - {item.email}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  subtitle: { marginTop: 30, fontSize: 18, fontWeight: 'bold' },
  usuarioItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});
