// Tela que exibe o histórico de compras do usuário

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import { supabase } from '../Services/supabase';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

export default function HistoricoScreen() {
  const { user } = useUser();     // Obtém dados do usuário logado
  const { theme } = useTheme();   // Estilos baseados no tema atual (claro/escuro)

  const [compras, setCompras] = useState([]);         // Lista de compras + itens
  const [loading, setLoading] = useState(true);       // Controle de carregamento
  const [itensAbertos, setItensAbertos] = useState({}); // Armazena quais compras estão abertas

  // Carrega o histórico assim que o usuário estiver disponível
  useEffect(() => {
    if (user) carregarHistorico();
  }, [user]);

  // -------------------------------------------
  // Função responsável por buscar o histórico
  // -------------------------------------------
  const carregarHistorico = async () => {
    try {
      setLoading(true);

      // Busca as compras do usuário ordenando da mais recente para a mais antiga
      const { data: comprasData, error } = await supabase
        .from('historico_compras')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Para cada compra, buscamos seus itens correspondentes
      const comprasComItens = await Promise.all(
        comprasData.map(async (compra) => {
          const { data: itensData } = await supabase
            .from('historico_itens')
            .select('*')
            .eq('compra_id', compra.id);

          // Retorna a compra + seus itens em um único objeto
          return { ...compra, itens: itensData };
        })
      );

      setCompras(comprasComItens);

    } catch (e) {
      console.error('Erro ao carregar histórico:', e);

    } finally {
      setLoading(false); // Finaliza carregamento
    }
  };

  // Abre/fecha os itens de uma compra específica
  const toggleItens = (id) => {
    setItensAbertos((prev) => ({
      ...prev,
      [id]: !prev[id], // alterna entre true/false
    }));
  };

  // -------------------------------------------------------
  // TELAS DE CARREGAMENTO OU LISTA VAZIA
  // -------------------------------------------------------

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.highlight} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Carregando histórico...
        </Text>
      </View>
    );
  }

  // Caso o usuário não tenha nenhuma compra registrada
  if (compras.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          Você ainda não fez nenhuma compra.
        </Text>
      </View>
    );
  }

  // -------------------------------------------------------
  // LISTA PRINCIPAL (HISTÓRICO)
  // -------------------------------------------------------

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={compras}
        keyExtractor={(item) => item.id.toString()} // cada compra tem um id único
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {/* Cabeçalho da compra (data + total + info pagamento) */}
            <TouchableOpacity onPress={() => toggleItens(item.id)}>
              <View style={styles.header}>
                <Text style={[styles.date, { color: theme.colors.text }]}>
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </Text>

                <Text style={[styles.total, { color: theme.colors.highlight }]}>
                  Total: R$ {item.total.toFixed(2)}
                </Text>
              </View>

              <Text
                style={[
                  styles.payment,
                  {
                    color:
                      theme.mode === 'dark'
                        ? theme.colors.placeholder
                        : theme.colors.link,
                  },
                ]}
              >
                💳 {item.payment_met} | Status: {item.status}
              </Text>
            </TouchableOpacity>

            {/* Itens da compra (visíveis apenas quando expandido) */}
            {itensAbertos[item.id] && (
              <View
                style={[
                  styles.itensContainer,
                  { borderColor: theme.colors.border },
                ]}
              >
                {item.itens.map((it, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text
                      style={[styles.itemName, { color: theme.colors.text }]}
                    >
                      {it.produto_nome}
                    </Text>

                    <Text
                      style={[
                        styles.itemQty,
                        { color: theme.colors.placeholder },
                      ]}
                    >
                      x{it.quantidade}
                    </Text>

                    <Text
                      style={[
                        styles.itemPrice,
                        { color: theme.colors.highlight },
                      ]}
                    >
                      R$ {it.preco_total.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

// -------------------------------------------------------
// ESTILOS DA TELA
// -------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },

  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 3, // leve sombra (no Android)
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  date: {
    fontSize: 16,
    fontWeight: '600',
  },

  total: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  payment: {
    marginTop: 6,
    fontSize: 14,
  },

  itensContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 8,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },

  itemName: {
    fontSize: 15,
  },

  itemQty: {
    fontSize: 15,
  },

  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 17,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
