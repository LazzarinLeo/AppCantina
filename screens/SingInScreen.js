import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
} from 'react-native';
import { supabase } from '../Services/supabase';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext'; // 👈 Import do tema

export default function SigninScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useUser();
  const { theme } = useTheme(); // 👈 pega tema atual (dark ou light)

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

      // ✅ Criar carteira do usuário automaticamente
      const { error: carteiraError } = await supabase
        .from('carteiras')
        .insert([{ usuario_id: data.id }]);

      if (carteiraError) {
        Alert.alert('Erro ao criar carteira', carteiraError.message);
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
    <View
      style={[
        styles.container,
        { backgroundColor: theme.mode === 'dark' ? '#000' : '#ffe8e0' },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: theme.mode === 'dark' ? '#fff' : '#6D4C41' },
        ]}
      >
        Cadastro de Usuário
      </Text>

      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={[
          styles.input,
          {
            backgroundColor: theme.mode === 'dark' ? '#1C1C1E' : '#fff',
            color: theme.mode === 'dark' ? '#fff' : '#6D4C41',
            borderColor: theme.mode === 'dark' ? '#333' : '#D7CCC8',
          },
        ]}
        placeholderTextColor={theme.mode === 'dark' ? '#aaa' : '#A1887F'}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[
          styles.input,
          {
            backgroundColor: theme.mode === 'dark' ? '#1C1C1E' : '#fff',
            color: theme.mode === 'dark' ? '#fff' : '#6D4C41',
            borderColor: theme.mode === 'dark' ? '#333' : '#D7CCC8',
          },
        ]}
        placeholderTextColor={theme.mode === 'dark' ? '#aaa' : '#A1887F'}
      />

      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={[
          styles.input,
          {
            backgroundColor: theme.mode === 'dark' ? '#1C1C1E' : '#fff',
            color: theme.mode === 'dark' ? '#fff' : '#6D4C41',
            borderColor: theme.mode === 'dark' ? '#333' : '#D7CCC8',
          },
        ]}
        placeholderTextColor={theme.mode === 'dark' ? '#aaa' : '#A1887F'}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.mode === 'dark' ? '#FF5722' : '#FF7043' },
        ]}
        onPress={cadastrarUsuario}
      >
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text
          style={[
            styles.link,
            { color: theme.mode === 'dark' ? '#ddd' : '#6D4C41' },
          ]}
        >
          Já tem conta?{' '}
          <Text
            style={[
              styles.highlight,
              { color: theme.mode === 'dark' ? '#FF7043' : '#FF7043' },
            ]}
          >
            Faça login
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
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
    marginTop: 20,
    textAlign: 'center',
    fontSize: 15,
  },
  highlight: {
    fontWeight: 'bold',
  },
});
