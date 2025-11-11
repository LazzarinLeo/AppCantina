import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet } from 'react-native';
import { supabase } from '../Services/supabase';
import { useUser } from '../contexts/UserContext';

export default function CarteiraScreen() {
  const { user } = useUser();
  const usuarioId = user.id;

  const [saldo, setSaldo] = useState(0);
  const [valor, setValor] = useState('');

  async function carregarSaldo() {
    try {
      const { data, error } = await supabase
        .from('carteiras')
        .select('saldo')
        .eq('usuario_id', usuarioId)
        .single();

      if (error) throw error;

      setSaldo(data.saldo);

    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
      Alert.alert('Erro', 'Não foi possível carregar o saldo.');
    }
  }

  async function adicionarSaldo() {
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Erro', 'Digite um valor válido.');
      return;
    }

    const { error } = await supabase.rpc('alterar_saldo', {
      usuario_id: usuarioId,
      valor: valorNumerico,
    });

    if (error) {
      console.error('Erro ao adicionar saldo:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o saldo.');
      return;
    }

    Alert.alert('Sucesso', `Adicionado R$${valorNumerico.toFixed(2)} à sua carteira.`);
    setValor('');
    carregarSaldo();
  }

  useEffect(() => {
    carregarSaldo();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>💳 Sua Carteira</Text>
      <Text style={styles.saldo}>Saldo atual: R$ {saldo.toFixed(2)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o valor para adicionar"
        keyboardType="numeric"
        value={valor}
        onChangeText={setValor}
      />

      <Button title="Adicionar Saldo" onPress={adicionarSaldo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  saldo: { fontSize: 20, marginBottom: 30, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});
