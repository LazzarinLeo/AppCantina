import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
const Produtos = require('../Services/Mock.json');

export default function ProdutosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Catálogo</Text>

      <FlatList
        data={Produtos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.imagem }} style={styles.imagem} />
              <TouchableOpacity style={styles.estrelaButton}>
                <Image source={require('../assets/estrela.png')} style={styles.estrela} />
              </TouchableOpacity>
            </View>

            <View style={styles.info}>
              <Text style={styles.nome}>{item.nome}</Text>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Adicionar ao carrinho</Text>
              </TouchableOpacity>
              <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
            </View>
          </View>
        )}
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
  },
  estrela: {
    width: 20,
    height: 20,
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
