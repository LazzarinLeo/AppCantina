import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext';
import { WalletContext } from '../contexts/WalletContext';
import { useNavigation } from '@react-navigation/native';

const Produtos = require('../Services/Mock.json');

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const NUM_COLS = 2;
const CARD_WIDTH = (width - (CARD_MARGIN * (NUM_COLS + 1)) - 32) / NUM_COLS;

export default function ProdutosScreen() {
  const [favoritos, setFavoritos] = useState([]);
  const navigation = useNavigation();
  const { addToCart, cartItems } = useContext(CartContext);
  const { saldo } = useContext(WalletContext);

  const heartScales = useRef({}).current;
  const getHeartScale = (id) => {
    if (!heartScales[id]) heartScales[id] = new Animated.Value(1);
    return heartScales[id];
  };

  const buttonScales = useRef({}).current;
  const getButtonScale = (id) => {
    if (!buttonScales[id]) buttonScales[id] = new Animated.Value(1);
    return buttonScales[id];
  };

  const toggleFavorito = (id) => {
    const isFav = favoritos.includes(id);
    setFavoritos((prev) => (isFav ? prev.filter((x) => x !== id) : [...prev, id]));
    const scale = getHeartScale(id);
    scale.setValue(0.8);
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const pressInButton = (id) => {
    const scale = getButtonScale(id);
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const pressOutButton = (id) => {
    const scale = getButtonScale(id);
    Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  };

  const Header = () => (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>Minha Loja</Text>
        <Text style={styles.headerSubtitle}>Produtos selecionados para você</Text>
      </View>

      <View style={styles.headerRight}>
        <Text style={styles.saldo}>💰 {saldo.toFixed(2)}</Text>

        <TouchableOpacity
          style={styles.cartIcon}
          onPress={() => navigation.navigate('Carrinho')}
          activeOpacity={0.8}
        >
          <Ionicons name="cart" size={26} color="#fff" />
          {cartItems.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }) => {
    const isFavorito = favoritos.includes(item.id);
    const heartScale = getHeartScale(item.id);
    const buttonScale = getButtonScale(item.id);

    return (
      <View style={[styles.card, { width: CARD_WIDTH }]}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: item.imagem }} style={styles.imagem} resizeMode="cover" />
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>R$ {item.preco.toFixed(2)}</Text>
          </View>

          <Pressable
            style={styles.favWrap}
            onPress={() => toggleFavorito(item.id)}
            android_ripple={{ color: '#ffffff22', radius: 20 }}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={isFavorito ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorito ? '#E53935' : '#fff'}
                style={isFavorito ? styles.heartFilled : styles.heartOutline}
              />
            </Animated.View>
          </Pressable>
        </View>

        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.nome}>{item.nome}</Text>

          <View style={styles.row}>
            <Text style={styles.precoSmall}>R$ {item.preco.toFixed(2)}</Text>

            <Pressable
              onPress={() => addToCart(item)}
              onPressIn={() => pressInButton(item.id)}
              onPressOut={() => pressOutButton(item.id)}
              android_ripple={{ color: '#00000010', borderless: false }}
              style={{ marginLeft: 8 }}
            >
              <Animated.View style={[styles.addButton, { transform: [{ scale: buttonScale }] }]}>
                <Ionicons name="cart" size={16} color="#fff" />
                <Text style={styles.addButtonText}>Adicionar</Text>
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.titulo}>Catálogo</Text>

      <FlatList
        data={Produtos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        numColumns={NUM_COLS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F4', paddingHorizontal: 16 },
  header: {
    marginTop: 40,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FF7A50',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: '#ffd9c9', fontSize: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  saldo: { color: '#fff', fontWeight: '700', marginRight: 10 },
  cartIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff2',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    elevation: 4,
  },
  badgeText: { color: '#E53935', fontWeight: '700', fontSize: 12 },

  titulo: { fontSize: 22, fontWeight: '800', color: '#3E2723', marginTop: 16, marginBottom: 8 },

  lista: { paddingBottom: 30, paddingTop: 6, gap: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    margin: CARD_MARGIN / 2,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  imageWrap: { position: 'relative', backgroundColor: '#f5f5f5' },
  imagem: { width: '100%', height: 140 },

  priceTag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: '#009688',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceTagText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  favWrap: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: '#00000028',
    borderRadius: 18,
    padding: 6,
  },
  heartFilled: { textShadowColor: '#fff2' },
  heartOutline: { opacity: 0.95 },

  info: { padding: 10 },
  nome: { color: '#3E2723', fontWeight: '700', fontSize: 14, marginBottom: 8 },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  precoSmall: { color: '#009688', fontWeight: '800', fontSize: 14 },

  addButton: {
    backgroundColor: '#FF7043',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 3,
  },
  addButtonText: { color: '#fff', fontWeight: '700', marginLeft: 6, fontSize: 13 },
});
