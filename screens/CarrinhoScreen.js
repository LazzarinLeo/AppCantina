import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CartContext } from '../contexts/CartContext';
import { WalletContext } from '../contexts/WalletContext';
import { Ionicons } from '@expo/vector-icons';

export default function CarrinhoScreen({ navigation }) {
  const { cartItems, removeFromCart, checkout } = useContext(CartContext);
  const { saldo } = useContext(WalletContext);

  const total = cartItems.reduce((acc, item) => acc + item.preco, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos antes de finalizar.');
      return;
    }
    const success = checkout();
    if (success) navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Seu Carrinho</Text>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.cartId}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => removeFromCart(item.cartId)}
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
          style={[
            styles.checkoutButton,
            { opacity: cartItems.length === 0 ? 0.6 : 1 },
          ]}
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
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#6D4C41', 
  },
  emptyText: {
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
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderColor: '#D7CCC8',
    borderWidth: 1,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
  },
  itemPrice: {
    fontSize: 15,
    color: '#009688',
    marginTop: 5,
  },
  removeButton: {
    backgroundColor: '#FF7043',
    borderRadius: 6,
    padding: 6,
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
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginVertical: 10,
  },
  checkoutButton: {
    backgroundColor: '#FFA726',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
