import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { WalletContext } from '../contexts/WalletContext';
import { supabase } from '../Services/supabase';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

export default function CarteiraScreen() {
  const { user } = useUser();
  const usuarioId = user?.id;

  const { saldo, carregarCarteira } = useContext(WalletContext);
  const { theme } = useTheme();

  const [valor, setValor] = useState('');

  async function adicionarSaldo() {
    const valorNumerico = parseFloat(valor);

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert("Erro", "Digite um valor válido.");
      return;
    }

    const { error } = await supabase.rpc("alterar_saldo", {
      usuario_id: usuarioId,
      valor: valorNumerico,
    });

    if (error) {
      console.error("Erro ao adicionar saldo:", error);
      Alert.alert("Erro", "Não foi possível atualizar o saldo.");
      return;
    }

    Alert.alert("Sucesso", `Adicionado R$${valorNumerico.toFixed(2)} à sua carteira.`);
    setValor("");
    carregarCarteira();
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        💳 Minha Carteira
      </Text>

      <Text style={[styles.saldo, { color: theme.colors.text }]}>
        Saldo atual: <Text style={{ fontWeight: "bold" }}>R$ {saldo.toFixed(2)}</Text>
      </Text>

      <TextInput
        placeholder="Digite o valor para adicionar"
        keyboardType="numeric"
        value={valor}
        onChangeText={setValor}
        placeholderTextColor={theme.colors.placeholder}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBackground,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.button }]}
        onPress={adicionarSaldo}
      >
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
          Adicionar Saldo
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  saldo: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
