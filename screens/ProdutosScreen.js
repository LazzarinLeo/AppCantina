import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
const Produtos = require('../Services/Mock.json');

export default function ProdutosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🍞 Produtos</Text>

      <FlatList
        data={Produtos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imagem }} style={styles.imagem} />
            <View style={styles.info}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', paddingTop: 50, paddingHorizontal: 16 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  lista: { paddingBottom: 30 },
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
  imagem: { width: '100%', height: 180 },
  info: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nome: { fontSize: 18, fontWeight: '600', color: '#444', flex: 1, marginRight: 10 },
  preco: { fontSize: 16, fontWeight: 'bold', color: '#009688' },
});
