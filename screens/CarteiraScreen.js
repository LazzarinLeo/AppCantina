
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
  const [formaSelecionada, setFormaSelecionada] = useState(null);

  async function adicionarSaldo() {
    const valorNumerico = parseFloat(valor);

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert("Erro", "Digite um valor válido.");
      return;
    }

    try {
      const { data: carteiraData, error: fetchError } = await supabase
        .from('carteiras')
        .select('saldo')
        .eq('usuario_id', usuarioId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const saldoAtual = carteiraData?.saldo || 0;
      const novoSaldo = saldoAtual + valorNumerico;

      const { error } = await supabase
        .from('carteiras')
        .upsert({ usuario_id: usuarioId, saldo: novoSaldo }, { onConflict: 'usuario_id' });

      if (error) throw error;

      Alert.alert("Sucesso", `Adicionado R$${valorNumerico.toFixed(2)} à sua carteira.`);
      setValor("");
      carregarCarteira();
    } catch (err) {
      console.error("Erro ao adicionar saldo:", err);
      Alert.alert("Erro", "Não foi possível atualizar o saldo.");
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        💳 Forma de Pagamento
      </Text>
      {formaSelecionada === null && (
        <>
          <TouchableOpacity
            style={[styles.option, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
            onPress={() => Alert.alert("Pix", "Pagamento via Pix em desenvolvimento.")}
          >
            <Text style={[styles.optionText, { color: theme.colors.text }]}>⚡ PIX</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
            onPress={() => setFormaSelecionada('cartao')}
          >
            <Text style={[styles.optionText, { color: theme.colors.text }]}>💳 Cartão</Text>
          </TouchableOpacity>
        </>
      )}
      {formaSelecionada === 'cartao' && (
        <>
          <TouchableOpacity onPress={() => setFormaSelecionada(null)}>
            <Text style={[styles.voltar, { color: theme.colors.text }]}>⬅ Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
            onPress={() => Alert.alert("Cartão", "Adicionar cartão em desenvolvimento.")}
          >
            <Text style={[styles.optionText, { color: theme.colors.text }]}>➕ Adicionar Cartão</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
            onPress={() => setFormaSelecionada('carteira')}
          >
            <Text style={[styles.optionText, { color: theme.colors.text }]}>💳 Cartão do Bruno</Text>
          </TouchableOpacity>
        </>
      )}
      {formaSelecionada === 'carteira' && (
        <>
          <TouchableOpacity onPress={() => setFormaSelecionada(null)}>
            <Text style={[styles.voltar, { color: theme.colors.text }]}>⬅ Voltar</Text>
          </TouchableOpacity>

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
        </>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  option: {
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2, 
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  voltar: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "left",
  },
  saldo: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});

