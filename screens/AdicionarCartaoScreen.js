// Importa ferramentas do React e React Native
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

// Função que salva o cartão no Supabase
import { adicionarCartao } from '../Services/cartaoService';

// Contexto para pegar os dados do usuário logado
import { useUser } from '../contexts/UserContext';

// Contexto para aplicar o tema claro/escuro
import { useTheme } from '../contexts/ThemeContext';

export default function AdicionarCartaoScreen({ navigation }) {
  const { user } = useUser(); // Usuário atual
  const { theme } = useTheme(); // Tema atual (dark/light)

  // Estados para controlar os campos do formulário
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  // Detecta bandeira automática do cartão baseado no número
  function detectarBandeira(n) {
    n = n.replace(/\D/g, ''); // Remove qualquer coisa que não for número
    if (/^4/.test(n)) return 'Visa';
    if (/^5[1-5]/.test(n)) return 'Mastercard';
    if (/^3[47]/.test(n)) return 'Amex';
    if (/^6/.test(n)) return 'Hipercard';
    return 'Cartão';
  }

  // Função executada ao apertar "Salvar Cartão"
  async function salvar() {
    // Validação: todos os campos precisam estar preenchidos
    if (!nome || !numero || !validade || !cvv) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true); // Ativa "Salvando..."

    const numeroLimpo = numero.replace(/\s/g, ''); // Remove espaços da máscara

    // Objeto enviado ao Supabase
    const payload = {
      usuario_id: user.id,
      nome_impresso: nome,
      numero_cartao: numeroLimpo,
      numero_encurtado: numeroLimpo.slice(-4), // Exibe apenas os 4 últimos
      validade,
      bandeira: detectarBandeira(numeroLimpo),
    };

    // Chama função que salva
    const { data, error } = await adicionarCartao(payload);

    setLoading(false);

    if (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível salvar o cartão.');
      return;
    }

    Alert.alert('Sucesso', 'Cartão salvo com sucesso!');
    navigation.goBack(); // Volta para tela anterior
  }

  // Gera estilos com base no tema atual
  const styles = makeStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Adicionar Cartão</Text>

        {/* Campo nome */}
        <TextInput
          placeholder="Nome impresso"
          value={nome}
          onChangeText={setNome}
          placeholderTextColor={theme.colors.placeholder}
          style={styles.input}
        />

        {/* Campo número com máscara */}
        <TextInput
          placeholder="Número do cartão"
          value={numero}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, ''); // Só números
            const masked = digits.replace(/(.{4})/g, '$1 ').trim(); // Insere espaços
            setNumero(masked);
          }}
          keyboardType="numeric"
          placeholderTextColor={theme.colors.placeholder}
          style={styles.input}
        />

        <View style={styles.row}>
          {/* Validade MM/AA */}
          <TextInput
            placeholder="MM/AA"
            value={validade}
            onChangeText={(t) => {
              const digits = t.replace(/\D/g, '');
              let v = digits;
              if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2, 4);
              setValidade(v);
            }}
            keyboardType="numeric"
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.input, styles.inputHalf]}
          />

          {/* CVV */}
          <TextInput
            placeholder="CVV"
            secureTextEntry
            value={cvv}
            onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
            keyboardType="numeric"
            placeholderTextColor={theme.colors.placeholder}
            style={[styles.input, styles.inputHalf]}
          />
        </View>

        {/* Botão salvar */}
        <TouchableOpacity
          onPress={salvar}
          style={[styles.button, { backgroundColor: theme.colors.button }]}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
            {loading ? 'Salvando...' : 'Salvar Cartão'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      padding: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 24,
      color: theme.colors.text,
    },
    input: {
      width: '100%',
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      marginBottom: 15,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.inputBackground,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    inputHalf: {
      width: '48%',
    },
    button: {
      paddingVertical: 14,
      borderRadius: 10,
      marginTop: 10,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 18,
      fontWeight: '700',
    },
  });
}
