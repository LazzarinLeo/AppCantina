// CarteiraScreen.js
// Tela onde o usuário gerencia formas de pagamento,
// vê o saldo da carteira, adiciona saldo e gerencia seus cartões.

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native';

// Contextos
import { WalletContext } from '../contexts/WalletContext';
import { supabase } from '../Services/supabase';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

// Serviços
import { listarCartoes, removerCartao } from '../Services/cartaoService';

export default function CarteiraScreen({ navigation }) {

  // Pegando usuário atual
  const { user } = useUser();
  const usuarioId = user?.id;

  // Dados da carteira
  const { saldo, carregarCarteira } = useContext(WalletContext);

  // Tema atual
  const { theme } = useTheme();

  // Estados locais da tela
  const [valor, setValor] = useState('');
  const [formaSelecionada, setFormaSelecionada] = useState(null);
  const [cartoes, setCartoes] = useState([]);

  // =================================================
  // Executado toda vez que a tela volta ao foco
  // Assim, garante que lista cartões atualizados
  // =================================================
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      carregarCartoes();
    });
    return unsubscribe;
  }, [navigation]);

  // Função que busca cartões do usuário
  async function carregarCartoes() {
    if (!usuarioId) return;

    const { data, error } = await listarCartoes(usuarioId);

    if (error) {
      console.error('Erro ao listar cartões:', error);
      return;
    }

    setCartoes(data || []);
  }

  // =================================================
  // Adicionar saldo à carteira via Supabase
  // =================================================
  async function adicionarSaldo() {

    // Converte String → Número
    const valorNumerico = parseFloat(valor.replace(',', '.'));

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Erro', 'Digite um valor válido.');
      return;
    }

    try {
      // Pega saldo atual do usuário
      const { data: carteiraData, error: fetchError } = await supabase
        .from('carteiras')
        .select('saldo')
        .eq('usuario_id', usuarioId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const saldoAtual = carteiraData?.saldo || 0;
      const novoSaldo = saldoAtual + valorNumerico;

      // Atualiza saldo no supabase
      const { error } = await supabase
        .from('carteiras')
        .upsert(
          { usuario_id: usuarioId, saldo: novoSaldo },
          { onConflict: 'usuario_id' }
        );

      if (error) throw error;

      Alert.alert('Sucesso', `Adicionado R$${valorNumerico.toFixed(2)} à sua carteira.`);

      setValor('');
      carregarCarteira(); // Atualiza saldo exibido

    } catch (err) {
      console.error('Erro ao adicionar saldo:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o saldo.');
    }
  }

  // =================================================
  // Remover cartão salvo
  // =================================================
  async function handleRemoverCartao(id) {
    Alert.alert('Remover', 'Deseja remover este cartão?', [
      { text: 'Cancelar', style: 'cancel' },

      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {

          const { error } = await removerCartao(id);

          if (error) {
            Alert.alert('Erro', 'Não foi possível remover o cartão.');
            return;
          }

          carregarCartoes();
        },
      },
    ]);
  }

  // Estilos dinâmicos do tema
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>

      {/* Título da página */}
      <Text style={styles.title}>💳 Forma de Pagamento</Text>

      {/* SELEÇÃO DE MÉTODO */}
      {formaSelecionada === null && (
        <>
          {/* PIX */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('Pix')}
          >
            <Text style={styles.optionText}>⚡ PIX</Text>
          </TouchableOpacity>

          {/* CARTÃO */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => setFormaSelecionada('cartao')}
          >
            <Text style={styles.optionText}>💳 Cartão</Text>
          </TouchableOpacity>
        </>
      )}

      {/* GERENCIAR CARTÕES */}
      {formaSelecionada === 'cartao' && (
        <>
          <TouchableOpacity onPress={() => setFormaSelecionada(null)}>
            <Text style={styles.voltar}>⬅ Voltar</Text>
          </TouchableOpacity>

          {/* Botão adicionar cartão */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('AdicionarCartao')}
          >
            <Text style={styles.optionText}>➕ Adicionar Cartão</Text>
          </TouchableOpacity>

          <Text style={[styles.subtitle, { color: theme.colors.text }]}>Seus cartões</Text>

          {/* Lista de cartões */}
          <FlatList
            data={cartoes}
            keyExtractor={(item) => item.id}
            style={{ width: '100%', marginTop: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setFormaSelecionada('carteira')}
                style={[
                  styles.cardItem,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.inputBackground,
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Text style={[styles.cardText, { color: theme.colors.text }]}>
                    {item.nome_cartao} •••• {String(item.numero_cartao).slice(-4)}
                  </Text>

                  <TouchableOpacity onPress={() => handleRemoverCartao(item.id)}>
                    <Text style={{ color: '#FF4D4F', fontWeight: '700' }}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {/* ADICIONAR SALDO */}
      {formaSelecionada === 'carteira' && (
        <>
          <TouchableOpacity onPress={() => setFormaSelecionada(null)}>
            <Text style={styles.voltar}>⬅ Voltar</Text>
          </TouchableOpacity>

          <Text style={[styles.saldo, { color: theme.colors.text }]}>
            Saldo atual:{' '}
            <Text style={{ fontWeight: '700' }}>
              R$ {Number(saldo || 0).toFixed(2)}
            </Text>
          </Text>

          {/* Input valor */}
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

          {/* Botão adicionar */}
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

// =================================================
// Estilos com suporte ao tema dark/light
// =================================================
function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'flex-start',
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color: theme.colors.text,
    },
    option: {
      paddingVertical: 16,
      borderRadius: 10,
      borderWidth: 1,
      marginBottom: 12,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      backgroundColor: theme.colors.inputBackground,
      borderColor: theme.colors.border,
    },
    optionText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    voltar: {
      fontSize: 16,
      marginBottom: 12,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    saldo: {
      fontSize: 20,
      textAlign: 'center',
      marginBottom: 14,
    },
    input: {
      width: '100%',
      borderRadius: 10,
      borderWidth: 1,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
    },
    button: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      elevation: 3,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: '700',
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '700',
      marginTop: 12,
    },
    cardItem: {
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      marginBottom: 10,
    },
    cardText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
