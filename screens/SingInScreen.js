import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { supabase } from '../Services/supabase';
import { useUser } from '../contexts/UserContext'; 

export default function SinginScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useUser(); 

  const emailValido = (email) => {
    const regex = /^[^\s@]+@estudante\.sesisenai\.org\.br$/;
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

    try {
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
        .insert([{ nome, email, senha }])
        .select()
        .single(); 

      if (error) {
        Alert.alert('Erro ao cadastrar', error.message);
        return;
      }


      login(data); 
      Alert.alert('Usuário cadastrado e logado com sucesso!');


      setNome('');
      setEmail('');
      setSenha('');


      navigation.navigate('Home');

    } catch (err) {
      Alert.alert('Erro inesperado', err.message);
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
        placeholderTextColor="#A1887F"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#A1887F"
      />

      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#A1887F"
      />

      <TouchableOpacity style={styles.button} onPress={cadastrarUsuario}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>
          Já tem conta?{' '}
          <Text style={styles.highlight}>Faça login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D7CCC8',
    padding: 12,
    marginBottom: 15,
    color: '#6D4C41',
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#FFA726',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#6D4C41',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 15,
  },
  highlight: {
    color: '#FFA726',
    fontWeight: 'bold',
  },
});
