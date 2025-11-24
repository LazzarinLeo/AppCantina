import React, { useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Platform, Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext';
import { WalletContext } from '../contexts/WalletContext';
import { useUser } from '../contexts/UserContext';
import { criarHistoricoCompra } from '../Services/HistoricoCompras';
import { adicionarItensCompra } from '../Services/HistoricoItens';
import { useTheme } from '../contexts/ThemeContext';

export default function CarrinhoScreen({ navigation }) {

  const [modalVisible, setModalVisible] = React.useState(false);
  const [inputTickets, setInputTickets] = React.useState("");
  const [descontoTicket, setDescontoTicket] = React.useState(0); // desconto aplicado
  const [ticketsUsados, setTicketsUsados] = React.useState(0);
  const [androidResolve, setAndroidResolve] = React.useState(null);

  const { cartItems, removeFromCart, checkout } = useContext(CartContext);
  const { tickets, descontarTickets, saldo, descontarSaldo } = useContext(WalletContext);
  const { user } = useUser();
  const { theme } = useTheme();

  const total = cartItems.reduce(
    (acc, item) => acc + item.preco * (item.quantidade || 1),
    0
  );

  const totalFinal = Math.max(total - descontoTicket, 0);

  const pedirTickets = () => {
    return new Promise((resolve) => {
      if (Platform.OS === "ios") {
        Alert.prompt(
          "Usar Tickets",
          `Você possui ${tickets} tickets. Quantos deseja usar?`,
          [
            { text: "Cancelar", style: "cancel", onPress: () => resolve(null) },
            {
              text: "Usar",
              onPress: (valor) => {
                const qtd = Number(valor);
                if (isNaN(qtd) || qtd < 0 || qtd > tickets) {
                  Alert.alert("Erro", "Quantidade inválida.");
                  resolve(null);
                } else resolve(qtd);
              }
            }
          ],
          "plain-text"
        );
      } else {
        // Android
        setInputTickets("");
        setModalVisible(true);

        // define resolve no estado
        setAndroidResolve(() => resolve);
      }
    });
  };


  const confirmarTicketsAndroid = () => {
    const qtd = Number(inputTickets);
    if (isNaN(qtd) || qtd < 0 || qtd > tickets) {
      Alert.alert("Erro", "Quantidade inválida.");
      return;
    }
    setModalVisible(false);
    if (androidResolve) {
      androidResolve(qtd);
      setAndroidResolve(null);
    }
  };

  // Aplicar desconto com tickets
  const usarTickets = async () => {
    if (tickets <= 0) {
      Alert.alert("Sem tickets", "Você não possui tickets disponíveis.");
      return;
    }
    const escolha = await pedirTickets();
    if (escolha === null) return;

    const descontoPercentual = escolha * 5;
    const descontoAplicado = (total * descontoPercentual) / 100;
    setDescontoTicket(descontoAplicado);
    setTicketsUsados(escolha);
  };

  // Checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos antes de finalizar.');
      return;
    }

    // Calcula desconto baseado nos tickets usados
    const descontoPercentual = ticketsUsados * 5;
    const descontoAplicado = (total * descontoPercentual) / 100;
    const totalFinalCheckout = Math.max(total - descontoAplicado, 0);

    if (saldo < totalFinalCheckout) {
      Alert.alert('Saldo insuficiente', 'Você não tem saldo suficiente.');
      return;
    }

    try {
      if (ticketsUsados > 0) {
        await descontarTickets(ticketsUsados);
      }
      await descontarSaldo(totalFinalCheckout);

      const user_id = user?.id;
      if (!user_id) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const compra = await criarHistoricoCompra(
        user_id,
        totalFinalCheckout,
        'concluida',
        'Carteira'
      );

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
    <View style={[styles.container, { backgroundColor: theme.mode === 'dark' ? '#1a1a1a' : '#F8FAFC' }]}>
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
          keyExtractor={(item) => item.cartId}
          renderItem={({ item }) => (
            <View style={[styles.itemCard, { backgroundColor: theme.mode === 'dark' ? '#1c1c1c' : '#FFFFFF' }]}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
                {item.quantidade && <Text style={styles.itemQty}>Qtd: {item.quantidade}</Text>}
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
          <Text style={styles.totalValor}>
            R$ {totalFinal.toFixed(2)}
          </Text>
        </View>

        {descontoTicket > 0 && (
          <Text style={{ color: '#43A047', fontSize: 14, marginTop: 2 }}>
            🎫 Desconto com tickets: -R$ {descontoTicket.toFixed(2)}
          </Text>
        )}

        <TouchableOpacity
          onPress={usarTickets}
          style={[styles.useTicketButton, { opacity: cartItems.length === 0 ? 0.6 : 1 }]}
          disabled={cartItems.length === 0 || tickets === 0}
        >
          <Text style={styles.checkoutText}>Usar Tickets</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkoutButton, { opacity: cartItems.length === 0 ? 0.6 : 1 }]}
          onPress={handleCheckout}
          disabled={cartItems.length === 0}
        >
          <Text style={styles.checkoutText}>Finalizar Compra</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Android */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' }}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>Você possui {tickets} tickets. Quantos deseja usar?</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="Digite a quantidade"
              value={inputTickets}
              onChangeText={setInputTickets}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 15 }}
            />

            <TouchableOpacity
              onPress={confirmarTicketsAndroid}
              style={{ backgroundColor: '#FF7043', padding: 12, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Usar Tickets</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    addingBottom: 10
  },
  headerBar: {
    backgroundColor: '#FF7043',
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    elevation: 3
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80
  },
  emptyText: {
    fontSize: 18,
    color: '#9E9E9E',
    marginTop: 10
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2
  },
  itemInfo: {
    flex: 1,
    marginRight: 12
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 2
  },
  itemPrice: {
    fontSize: 15,
    color: '#43A047',
    marginBottom: 2
  },
  itemQty: {
    fontSize: 14,
    color: '#757575'
  },
  removeButton: {
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 10
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: '#ECEFF1'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  saldo: {
    fontSize: 15,
    color: '#607D8B'
  },
  saldoValor: {
    fontSize: 15,
    color: '#607D8B',
    fontWeight: '600'
  },
  totalLabel: {
    fontSize: 18,
    color: '#37474F',
    fontWeight: '700'
  },
  totalValor: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF7043'
  },
  checkoutButton: {
    backgroundColor: '#FF7043',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    elevation: 4
  },
  useTicketButton: {
    backgroundColor: '#43A047',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  checkoutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700'
  },
});
