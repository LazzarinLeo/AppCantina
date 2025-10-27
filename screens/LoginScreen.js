import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { supabase } from '../Services/supabase';
import { useUser } from '../contexts/UserContext'; // 👈 Importa o contexto

export default function LoginScreen({ navigation }) {
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useUser(); // 👈 Usa a função de login global

  async function fazerLogin() {
    if (!identificador || !senha) {
      Alert.alert('Preencha todos os campos!');
      return;
    }

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(identificador);

      const { data: user, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq(isEmail ? 'email' : 'nome', identificador)
        .eq('senha', senha)
        .single();

      if (error || !user) {
        Alert.alert('Usuário ou senha incorretos!');
        return;
      }

      // ✅ Salva o usuário globalmente
      login(user);

      Alert.alert('Login realizado com sucesso!');
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Erro inesperado', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cantina Escolar</Text>

      <TextInput
        placeholder="Email ou Nome de Usuário"
        value={identificador}
        onChangeText={setIdentificador}
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

      <TouchableOpacity style={styles.button} onPress={fazerLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Singin')}>
        <Text style={styles.link}>Ainda não tem conta? Cadastre-se</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 40,
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
});
