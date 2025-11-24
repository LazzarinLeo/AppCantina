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
  const { user } = useUser();
  const { theme } = useTheme();

  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itensAbertos, setItensAbertos] = useState({});

  useEffect(() => {
    if (user) carregarHistorico();
  }, [user]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);

      const { data: comprasData, error } = await supabase
        .from('historico_compras')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const comprasComItens = await Promise.all(
        comprasData.map(async (compra) => {
          const { data: itensData } = await supabase
            .from('historico_itens')
            .select('*')
            .eq('compra_id', compra.id);

          return { ...compra, itens: itensData };
        })
      );

      setCompras(comprasComItens);
    } catch (e) {
      console.error('Erro ao carregar histórico:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleItens = (id) => {
    setItensAbertos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // ------------------ TELAS DE ESPERA / VAZIO ------------------

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

  // ------------------ LISTA PRINCIPAL ------------------

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={compras}
        keyExtractor={(item) => item.id.toString()}
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

            {itensAbertos[item.id] && (
              <View
                style={[
                  styles.itensContainer,
                  { borderColor: theme.colors.border },
                ]}
              >
                {item.itens.map((it, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={[styles.itemName, { color: theme.colors.text }]}>
                      {it.produto_nome}
                    </Text>
                    <Text
                      style={[styles.itemQty, { color: theme.colors.placeholder }]}
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

// ------------------------ ESTILOS ------------------------

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
    elevation: 3,
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
