import React, { useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Platform, Modal, TextInput
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

import { CartContext } from '../contexts/CartContext';
import { WalletContext } from '../contexts/WalletContext';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

import { criarHistoricoCompra } from '../Services/HistoricoCompras';
import { adicionarItensCompra } from '../Services/HistoricoItens';

export default function CarrinhoScreen({ navigation }) {
  // Estados gerais
  const [modalVisible, setModalVisible] = React.useState(false);
  const [inputTickets, setInputTickets] = React.useState("");
  const [descontoTicket, setDescontoTicket] = React.useState(0);
  const [ticketsUsados, setTicketsUsados] = React.useState(0);
  const [androidResolve, setAndroidResolve] = React.useState(null);

  // Estados do QR
  const [qrVisible, setQrVisible] = React.useState(false);
  const [qrValue, setQrValue] = React.useState("");

  // Contextos
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const { tickets, descontarTickets, saldo, descontarSaldo } = useContext(WalletContext);
  const { user } = useUser();
  const { theme } = useTheme();

  const total = cartItems.reduce(
    (acc, item) => acc + item.preco * (item.quantidade || 1),
    0
  );

  const totalFinal = Math.max(total - descontoTicket, 0);

  // ---------------------
  // PEDIR TICKETS
  // ---------------------
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
        setInputTickets("");
        setModalVisible(true);
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
    androidResolve(qtd);
    setAndroidResolve(null);
  };

  // ---------------------
  // APLICAR TICKETS
  // ---------------------
  const usarTickets = async () => {
    if (tickets <= 0) {
      Alert.alert("Sem tickets", "Você não possui tickets.");
      return;
    }

    const escolha = await pedirTickets();
    if (escolha === null) return;

    const desconto = (total * (escolha * 5)) / 100;

    setDescontoTicket(desconto);
    setTicketsUsados(escolha);
  };

  // ---------------------
  // FINALIZAR COMPRA + GERAR QR
  // ---------------------
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Carrinho vazio", "Adicione itens antes.");
      return;
    }

    const descontoAplicado = (total * (ticketsUsados * 5)) / 100;

    const totalFinalCheckout = Math.max(total - descontoAplicado, 0);

    if (saldo < totalFinalCheckout) {
      Alert.alert("Saldo insuficiente", "Deposite mais na carteira.");
      return;
    }

    try {
      if (ticketsUsados > 0) {
        await descontarTickets(ticketsUsados);
      }

      await descontarSaldo(totalFinalCheckout);

      const user_id = user?.id;
      if (!user_id) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      const compra = await criarHistoricoCompra(
        user_id,
        totalFinalCheckout,
        "concluida",
        "Carteira"
      );

      await adicionarItensCompra(compra.id, cartItems);

      clearCart();

      // DADOS DO QR
      const dadosQR = {
        compraId: compra.id,
        usuarioId: user_id,
        total: totalFinalCheckout,
        horario: new Date().toISOString()
      };

      setQrValue(JSON.stringify(dadosQR));
      setQrVisible(true);

    } catch (e) {
      console.log(e);
      Alert.alert("Erro", "Não foi possível finalizar.");
    }
  };

  // ---------------------
  // RENDER
  // ---------------------
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <View style={[styles.headerBar, { backgroundColor: theme.colors.button }]}>
        <Text style={styles.headerText}>🛒 Seu Carrinho</Text>
      </View>

      {/* LISTAGEM */}
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
            <View style={[styles.itemCard, { backgroundColor: theme.colors.card }]}>
              <View>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>
                  {item.nome}
                </Text>
                <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
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

      {/* RODAPÉ */}
      <View style={styles.footer}>

        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValor}>R$ {totalFinal.toFixed(2)}</Text>
        </View>

        {descontoTicket > 0 && (
          <Text style={{ color: "#43A047", marginTop: 6 }}>
            🎫 Desconto: -R$ {descontoTicket.toFixed(2)}
          </Text>
        )}

        <TouchableOpacity
          onPress={usarTickets}
          style={styles.useTicketButton}
        >
          <Text style={styles.checkoutText}>Usar Tickets</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCheckout}
          style={styles.checkoutButton}
        >
          <Text style={styles.checkoutText}>Finalizar Compra</Text>
        </TouchableOpacity>
      </View>

      {/* ------------------ MODAL DO QR ------------------ */}
      <Modal visible={qrVisible} transparent animationType="fade">
        <View style={styles.qrOverlay}>
          <View style={[styles.qrBox, { backgroundColor: theme.mode === "dark" ? "#000" : "#fff" }]}>

            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.mode === "dark" ? "#fff" : "#333",
                marginBottom: 15
              }}
            >
              QR Code da Compra
            </Text>

            <View style={{ backgroundColor: "#fff", padding: 10, borderRadius: 8 }}>
              <QRCode value={qrValue || " "} size={230} />
            </View>

            <TouchableOpacity
              onPress={() => setQrVisible(false)}
              style={styles.closeButton}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Fechar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}

// ------------------ ESTILOS ------------------

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },

  headerBar: {
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20
  },

  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center"
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },

  emptyText: { fontSize: 18, marginTop: 10, color: "#BDBDBD" },

  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12
  },

  itemName: { fontSize: 17, fontWeight: "700" },
  itemPrice: { fontSize: 16, color: "#43A047", marginTop: 4 },

  removeButton: {
    backgroundColor: "#E53935",
    padding: 10,
    borderRadius: 10
  },

  footer: { marginTop: 20 },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6
  },

  totalLabel: { fontSize: 18, fontWeight: "700", color: "#333" },
  totalValor: { fontSize: 18, fontWeight: "700", color: "#FF7043" },

  checkoutButton: {
    backgroundColor: "#FF7043",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12
  },

  useTicketButton: {
    backgroundColor: "#43A047",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10
  },

  checkoutText: { color: "#fff", fontSize: 17, fontWeight: "700" },

  // modal QR
  qrOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center"
  },

  qrBox: {
    width: 300,
    padding: 20,
    borderRadius: 18,
    alignItems: "center"
  },

  closeButton: {
    backgroundColor: "#FF7043",
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10
  }
});
