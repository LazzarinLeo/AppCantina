import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext';
import { WalletContext } from '../contexts/WalletContext';
import { useUser } from '../contexts/UserContext';
import { criarHistoricoCompra } from '../Services/HistoricoCompras';
import { adicionarItensCompra } from '../Services/HistoricoItens';
import { useTheme } from '../contexts/ThemeContext';

export default function CarrinhoScreen({ navigation }) {
  const { cartItems, removeFromCart, checkout } = useContext(CartContext);
  const { saldo } = useContext(WalletContext);
  const { user } = useUser();
  const { theme } = useTheme();

  const total = cartItems.reduce(
    (acc, item) => acc + item.preco * (item.quantidade || 1),
    0
  );

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos antes de finalizar.');
      return;
    }

    if (saldo < total) {
      Alert.alert('Saldo insuficiente', 'Você não tem saldo suficiente.');
      return;
    }

    try {
      const user_id = user?.id;
      if (!user_id) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const status = 'concluida';
      const payment_method = 'Carteira';
      const compra = await criarHistoricoCompra(user_id, total, status, payment_method);

      if (!compra?.id) throw new Error('Erro ao criar compra');
      await adicionarItensCompra(compra.id, cartItems);

      checkout();
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      Alert.alert('Erro', 'Não foi possível finalizar sua compra.');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.mode === 'dark' ? '#1a1a1a' : '#F8FAFC' },
      ]}
    >
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>🛒 Seu Carrinho</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={60} color="#BDBDBD" />
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={item => item.cartId}
          renderItem={({ item }) => (
            <View
              style={[
                styles.itemCard,
                { backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : '#FFFFFF' },
              ]}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
                {item.quantidade && (
                  <Text style={styles.itemQty}>Qtd: {item.quantidade}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => removeFromCart(item.cartId)}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <View style={styles.priceRow}>
          <Text style={styles.saldo}>💰 Saldo:</Text>
          <Text style={styles.saldoValor}>R$ {saldo.toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValor}>R$ {total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, { opacity: cartItems.length === 0 ? 0.6 : 1 }]}
          onPress={handleCheckout}
          disabled={cartItems.length === 0}
        >
          <Text style={styles.checkoutText}>Finalizar Compra</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  headerBar: {
    backgroundColor: '#FF7043',
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#9E9E9E',
    marginTop: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 15,
    color: '#43A047',
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 14,
    color: '#757575',
  },
  removeButton: {
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 10,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: '#ECEFF1',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  saldo: {
    fontSize: 15,
    color: '#607D8B',
  },
  saldoValor: {
    fontSize: 15,
    color: '#607D8B',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 18,
    color: '#37474F',
    fontWeight: '700',
  },
  totalValor: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF7043',
  },
  checkoutButton: {
    backgroundColor: '#FF7043',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    elevation: 4,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
