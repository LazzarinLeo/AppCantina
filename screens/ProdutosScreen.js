import React, { useState, useContext } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext';
import { WalletContext } from '../contexts/WalletContext';
import { useNavigation } from '@react-navigation/native';

const Produtos = require('../Services/Mock.json');


export default function ProdutosScreen() {
  const [favoritos, setFavoritos] = useState([]);
  const navigation = useNavigation();
  const { addToCart, cartItems } = useContext(CartContext);
  const { saldo } = useContext(WalletContext);

  const toggleFavorito = (id) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.saldo}>💰 R$ {saldo.toFixed(2)}</Text>
      
      <TouchableOpacity style={styles.cartIcon} onPress={() => navigation.navigate('Carrinho')}
      >
        <Ionicons name="cart" size={28} color="#009688" />
        {cartItems.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartItems.length}</Text>
          </View>
        )}
      </TouchableOpacity>

    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <Text style={styles.titulo}>Catálogo</Text>

      <FlatList
        data={Produtos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => {
          const isFavorito = favoritos.includes(item.id);
          return (
            <View style={styles.card}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.imagem }} style={styles.imagem} />
                <TouchableOpacity
                  style={styles.estrelaButton}
                  onPress={() => toggleFavorito(item.id)}
                >
                  <Ionicons
                    name={isFavorito ? 'star' : 'star-outline'}
                    size={24}
                    color={isFavorito ? '#FFD700' : '#999'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.info}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>

                <TouchableOpacity style={styles.button} onPress={() => addToCart(item)}>
                  <Text style={styles.buttonText}>Adicionar ao carrinho</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  saldo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 16,
    color: '#333',
  },
  cartIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  lista: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  imagem: {
    width: '100%',
    height: 180,
  },
  estrelaButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5
  },
  info: {
    padding: 12,
    flexDirection: 'column',
    gap: 8,
  },
  nome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  preco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#009688',
  },
  button: {
    width: '100%',
    backgroundColor: '#FFA726',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
