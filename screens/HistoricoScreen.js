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

export default function HistoricoScreen() {
  const { user } = useUser();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itensAbertos, setItensAbertos] = useState({}); // controla expandir/recolher

  useEffect(() => {
    if (user) {
      carregarHistorico();
    }
  }, [user]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      // Busca as compras do usuário
      const { data: comprasData, error } = await supabase
        .from('historico_compras')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Para cada compra, busca seus itens
      const comprasComItens = await Promise.all(
        comprasData.map(async (compra) => {
          const { data: itensData, error: itensError } = await supabase
            .from('historico_itens')
            .select('*')
            .eq('compra_id', compra.id);

          if (itensError) throw itensError;

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA000" />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  if (compras.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Você ainda não fez nenhuma compra.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={compras}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => toggleItens(item.id)}>
              <View style={styles.header}>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={styles.total}>Total: R$ {item.total.toFixed(2)}</Text>
              </View>

              <Text style={styles.payment}>
                💳 {item.payment_met} | Status: {item.status}
              </Text>
            </TouchableOpacity>

            {itensAbertos[item.id] && (
              <View style={styles.itensContainer}>
                {item.itens.map((it, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{it.produto_nome}</Text>
                    <Text style={styles.itemQty}>x{it.quantidade}</Text>
                    <Text style={styles.itemPrice}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 16,
    color: '#6D4C41',
    fontWeight: '600',
  },
  total: {
    fontSize: 16,
    color: '#388E3C',
    fontWeight: 'bold',
  },
  payment: {
    marginTop: 6,
    color: '#8D6E63',
  },
  itensContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    paddingTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 15,
    color: '#5D4037',
  },
  itemQty: {
    fontSize: 15,
    color: '#8D6E63',
  },
  itemPrice: {
    fontSize: 15,
    color: '#388E3C',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 17,
    color: '#8D6E63',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8D6E63',
  },
});
