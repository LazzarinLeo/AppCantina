import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { supabase } from '../Services/supabase';

export default function SinginScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const emailValido = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  async function cadastrarUsuario() {
    if (!nome || !email || !senha) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    if (!emailValido(email)) {
      Alert.alert('Digite um email válido!');
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
    }
  }

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
});
