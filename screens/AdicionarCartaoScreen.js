// screens/AdicionarCartaoScreen.js
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

import { adicionarCartao } from '../Services/cartaoService';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

export default function AdicionarCartaoScreen({ navigation }) {
  const { user } = useUser();
  const { theme } = useTheme();

  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  function detectarBandeira(n) {
    n = n.replace(/\D/g, '');
    if (/^4/.test(n)) return 'Visa';
    if (/^5[1-5]/.test(n)) return 'Mastercard';
    if (/^3[47]/.test(n)) return 'Amex';
    if (/^6/.test(n)) return 'Hipercard';
    return 'Cartão';
  }

  async function salvar() {
    if (!nome || !numero || !validade || !cvv) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);

    const numeroLimpo = numero.replace(/\s/g, '');

    const payload = {
      usuario_id: user.id,
      nome_impresso: nome,
      numero_cartao: numeroLimpo,
      numero_encurtado: numeroLimpo.slice(-4),
      validade,
      bandeira: detectarBandeira(numeroLimpo),
    };

    const { data, error } = await adicionarCartao(payload);

    setLoading(false);

    if (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível salvar o cartão.');
      return;
    }

    Alert.alert('Sucesso', 'Cartão salvo com sucesso!');
    navigation.goBack();
  }

  const styles = makeStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Adicionar Cartão</Text>

        <TextInput
          placeholder="Nome impresso"
          value={nome}
          onChangeText={setNome}
          placeholderTextColor={theme.colors.placeholder}
          style={styles.input}
        />

        <TextInput
          placeholder="Número do cartão"
          value={numero}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, '');
            const masked = digits.replace(/(.{4})/g, '$1 ').trim();
            setNumero(masked);
          }}
          keyboardType="numeric"
          placeholderTextColor={theme.colors.placeholder}
          style={styles.input}
        />

        <View style={styles.row}>
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
