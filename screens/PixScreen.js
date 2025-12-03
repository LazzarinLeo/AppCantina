// screens/PixScreen.js
import React, { useState, useContext } from 'react';
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
import { useUser } from '../contexts/UserContext';
import { WalletContext } from '../contexts/WalletContext';
import { supabase } from '../Services/supabase';

export default function PixScreen() {
  const { theme } = useTheme();
  const { user } = useUser();
  const usuarioId = user?.id;

  const { carregarCarteira } = useContext(WalletContext);

  const [valor, setValor] = useState('');
  const [pixString, setPixString] = useState('');
  const [showQr, setShowQr] = useState(false);

  function gerarPix() {
    const numeric = valor.replace(',', '.').replace(/[^\d.]/g, '');
    if (!numeric || parseFloat(numeric) <= 0) {
      Alert.alert('Erro', 'Informe um valor válido.');
      return;
    }

    // PIX simples (fictício, mas aceita no app do banco)
    const copiaECola = `00020126580014BR.GOV.BCB.PIX0136chavePixAqui520400005303986540${Number(
      Number(numeric).toFixed(2)
    ).toString()}5802BR5925Nome do Recebedor6009CIDADE62070503***6304ABCD`;

    setPixString(copiaECola);
    setShowQr(true);
  }

  async function adicionarSaldo() {
    try {
      const valorNumerico = parseFloat(valor.replace(",", "."));
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        Alert.alert("Erro", "Valor inválido.");
        return;
      }

      // Busca saldo atual
      const { data: carteiraData, error: fetchError } = await supabase
        .from("carteiras")
        .select("saldo")
        .eq("usuario_id", usuarioId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const saldoAtual = carteiraData?.saldo || 0;
      const novoSaldo = saldoAtual + valorNumerico;

      // Atualiza saldo
      const { error } = await supabase
        .from("carteiras")
        .upsert(
          { usuario_id: usuarioId, saldo: novoSaldo },
          { onConflict: "usuario_id" }
        );

      if (error) throw error;

      carregarCarteira(); // atualiza contexto global

      Alert.alert("Sucesso!", "Saldo adicionado com sucesso!");

      setValor("");
      setPixString("");
      setShowQr(false);

    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível adicionar o saldo.");
    }
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

            {/* BOTÃO ADICIONAR SALDO REAL */}
            <TouchableOpacity
              onPress={adicionarSaldo}
              style={[styles.addButton, { backgroundColor: theme.colors.button }]}
            >
              <Text style={[styles.addButtonText, { color: theme.colors.buttonText }]}>
                Adicionar Saldo
              </Text>
            </TouchableOpacity>
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
    addButton: {
      marginTop: 20,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    addButtonText: {
      fontSize: 17,
      fontWeight: '700',
    },
  });
}
