// screens/PixScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../contexts/ThemeContext';

export default function PixScreen() {
  const { theme } = useTheme();

  const [valor, setValor] = useState('');
  const [pixString, setPixString] = useState('');
  const [showQr, setShowQr] = useState(false);

  function gerarPix() {
    const numeric = valor.replace(',', '.').replace(/[^\d.]/g, '');
    if (!numeric || parseFloat(numeric) <= 0) {
      Alert.alert('Erro', 'Informe um valor válido.');
      return;
    }

    // Exemplo de string simples (não é EMV completo). Substitua chavePixAqui pela sua chave.
    const copiaECola = `00020126580014BR.GOV.BCB.PIX0136chavePixAqui520400005303986540${Number(
      Number(numeric).toFixed(2)
    ).toString()}5802BR5925Nome do Recebedor6009CIDADE62070503***6304ABCD`;

    setPixString(copiaECola);
    setShowQr(true);
  }

  const styles = makeStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Pagamento via PIX</Text>

        <TextInput
          placeholder="Valor (ex: 10.00)"
          placeholderTextColor={theme.colors.placeholder}
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity
          onPress={gerarPix}
          style={[styles.button, { backgroundColor: theme.colors.button }]}
        >
          <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
            Gerar QRCode PIX
          </Text>
        </TouchableOpacity>

        {showQr && pixString !== '' && (
          <View style={styles.qrContainer}>
            <QRCode value={pixString} size={260} />
            <Text style={styles.qrLabel}>Aproxime o QR no app do seu banco</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    inner: {
      padding: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
    },
    input: {
      width: '100%',
      backgroundColor: theme.colors.inputBackground,
      borderColor: theme.colors.border,
      borderWidth: 1,
      color: theme.colors.text,
      padding: 12,
      borderRadius: 10,
      marginBottom: 12,
      fontSize: 16,
    },
    button: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 18,
    },
    buttonText: {
      fontSize: 17,
      fontWeight: '700',
    },
    qrContainer: {
      marginTop: 10,
      alignItems: 'center',
    },
    qrLabel: {
      marginTop: 12,
      color: theme.colors.text,
      fontSize: 14,
    },
  });
}
