// Tela responsável por exibir os itens do carrinho, aplicar tickets,
// calcular total final, finalizar a compra e gerar QR Code da compra.

import React, { useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

// Contextos
import { CartContext } from '../contexts/CartContext';
import { WalletContext } from '../contexts/WalletContext';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

// Serviços de histórico
import { criarHistoricoCompra } from '../Services/HistoricoCompras';
import { adicionarItensCompra } from '../Services/HistoricoItens';

export default function CarrinhoScreen({ navigation }) {

  // Estados da tela
  const [modalVisible, setModalVisible] = React.useState(false);
  const [inputTickets, setInputTickets] = React.useState("");
  const [qrVisible, setQrVisible] = React.useState(false);
  const [qrValue, setQrValue] = React.useState("");

  // Lista de itens marcados como grátis usando tickets
  const [itensGratis, setItensGratis] = React.useState([]);

  // Contextos
  const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
  const { tickets, descontarTickets, saldo, descontarSaldo } = useContext(WalletContext);
  const { user } = useUser();
  const { theme } = useTheme();

  // CÁLCULO DO TOTAL FINAL DA COMPRA
  // Exclui do cálculo itens que foram marcados como grátis
  const totalFinal = cartItems.reduce((acc, item) => {
    if (itensGratis.includes(item.cartId)) return acc;
    return acc + item.preco * (item.quantidade || 1);
  }, 0);

  // Marcar / desmarcar item como gratis via ticket
  const toggleItemGratis = (id) => {

    // Se já está marcado como grátis → desmarca
    if (itensGratis.includes(id)) {
      setItensGratis(prev => prev.filter(x => x !== id));
      return;
    }

    // Verifica se o usuário tem tickets suficientes
    if (itensGratis.length >= tickets) {
      Alert.alert("Limite de Tickets", "Você não tem tickets suficientes.");
      return;
    }

    // Marca item como grátis
    setItensGratis(prev => [...prev, id]);
  };

  // FINALIZAR COMPRA
  // Salva no Supabase, gera histórico e QR Code
  const handleCheckout = async () => {

    if (cartItems.length === 0) {
      Alert.alert("Carrinho vazio", "Adicione itens antes.");
      return;
    }

    if (saldo < totalFinal) {
      Alert.alert("Saldo insuficiente", "Deposite mais dinheiro.");
      return;
    }

    try {
      const ticketsUsados = itensGratis.length;

      // Desconta tickets
      if (ticketsUsados > 0) {
        await descontarTickets(ticketsUsados);
      }

      // Desconta saldo
      await descontarSaldo(totalFinal);

      // Identificação do usuário
      const user_id = user?.id;
      if (!user_id) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      // Registro da compra no histórico
      const compra = await criarHistoricoCompra(
        user_id,
        totalFinal,
        "concluida",
        "Carteira"
      );

      // Registrar itens da compra
      await adicionarItensCompra(compra.id, cartItems);

      // Limpa o carrinho após finalizar
      clearCart();

      // Monta os dados do QR Code
      const dadosQR = {
        compraId: compra.id,
        usuarioId: user_id,
        itensGratis,
        total: totalFinal,
        horario: new Date().toISOString()
      };

      setQrValue(JSON.stringify(dadosQR));
      setQrVisible(true);

    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Falha ao finalizar compra.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* HEADER */}
      <View style={[styles.headerBar, { backgroundColor: theme.colors.button }]}>
        <Text style={styles.headerText}>🛒 Seu Carrinho</Text>
      </View>

      {/* LISTA DE ITENS */}
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
                {/* Nome do produto */}
                <Text style={[styles.itemName, { color: theme.colors.text }]}>
                  {item.nome}
                </Text>

                {/* Preço */}
                <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
              </View>

              {/* Botões: Ticket + Remover */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>

                {/* BOTÃO DE TICKET */}
                <TouchableOpacity
                  onPress={() => toggleItemGratis(item.cartId)}
                  style={[
                    styles.ticketButton,
                    { backgroundColor: itensGratis.includes(item.cartId) ? "#43A047" : "#AAA" }
                  ]}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {itensGratis.includes(item.cartId) ? "✔ Grátis" : "Ticket"}
                  </Text>
                </TouchableOpacity>

                {/* REMOVER ITEM DO CARRINHO */}
                <TouchableOpacity
                  onPress={() => removeFromCart(item.cartId)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={22} color="#fff" />
                </TouchableOpacity>

              </View>
            </View>
          )}
        />
      )}

      {/* FOOTER */}
      <View style={styles.footer}>

        {/* TOTAL */}
        <View style={styles.priceRow}>
          <Text style={[styles.totalLabel, theme.mode === 'dark' ? { color: '#daead7' } : { color: '#4E342E' }]}>
            Total:
          </Text>
          <Text style={[styles.totalValor, theme.mode === 'dark' ? { color: '#703dff' } : { color: '#FF7043' }]}>
            R$ {totalFinal.toFixed(2)}
          </Text>
        </View>

        {/* BOTÃO FINALIZAR */}
        <TouchableOpacity
          onPress={handleCheckout}
          style={[
            styles.checkoutButton,
            theme.mode === 'dark'
              ? { backgroundColor: '#703dff' }
              : { backgroundColor: '#FF7043' }
          ]}
        >
          <Text style={styles.checkoutText}>Finalizar Compra</Text>
        </TouchableOpacity>

      </View>

      {/* MODAL DO QR CODE */}
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

            {/* O QR CODE EM SI */}
            <View style={{ backgroundColor: "#fff", padding: 10, borderRadius: 8 }}>
              <QRCode value={qrValue || " "} size={230} />
            </View>

            {/* FECHAR */}
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

// ------------------------ STYLES ------------------------ 
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

  ticketButton: {
    padding: 10,
    borderRadius: 10,
    marginRight: 10
  },

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

  totalLabel: { fontSize: 18, fontWeight: "700" },
  totalValor: { fontSize: 18, fontWeight: "700" },

  checkoutButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12
  },

  checkoutText: { color: "#fff", fontSize: 17, fontWeight: "700" },

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
