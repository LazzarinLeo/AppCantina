import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

export const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cantina Escolar Shereka</Text>

      <Text style={styles.subtitle}>
        Seja bem-vindo(a)! Escolha uma opção para começar.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Details')}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Ir para Detalhes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1', // cor clara e aconchegante (amarelo claro)
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6D4C41', // marrom, lembra alimentos naturais
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8D6E63', // marrom claro
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFA726', // laranja vibrante, que lembra comida/apetite
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3, // sombra leve no Android
    shadowColor: '#000', // sombra no iOS
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
