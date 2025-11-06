import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext';
import { WalletContext } from '../contexts/WalletContext';
import { useUser } from '../contexts/UserContext';
import { criarHistoricoCompra } from '../Services/HistoricoCompras';
import { adicionarItensCompra } from '../Services/HistoricoItens';

export default function CarrinhoScreen({ navigation }) {
  const { cartItems, removeFromCart, checkout } = useContext(CartContext);
  const { saldo } = useContext(WalletContext);
  const { user } = useUser();

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

    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      Alert.alert('Erro', 'Não foi possível finalizar sua compra.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Seu Carrinho</Text>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
                {item.quantidade && (
                  <Text style={styles.itemQty}>Qtd: {item.quantidade}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => removeFromCart(item.id)}
                style={styles.removeButton}
              >
                <Ionicons name="trash" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.saldo}>💰 Saldo: R$ {saldo.toFixed(2)}</Text>
        <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>

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
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#6D4C41',
  },
  emptyText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    color: '#8D6E63',
    marginTop: 40,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderColor: '#D7CCC8',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#5D4037',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    color: '#009688',
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 14,
    color: '#757575',
  },
  removeButton: {
    backgroundColor: '#FF7043',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#D7CCC8',
  },
  saldo: {
    fontSize: 16,
    color: '#5D4037',
    marginBottom: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6D4C41',
    marginVertical: 12,
  },
  checkoutButton: {
    backgroundColor: '#FFA726',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
