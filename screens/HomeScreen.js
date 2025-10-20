import React from 'react';
import { Text, View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';

export const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <Text style={styles.title}>Cantina Escolar</Text>

        <ScrollView style={styles.Menu} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.item}>Pão de queijo</Text>
          <Text style={styles.item}>Coxinha</Text>
          <Text style={styles.item}>Suco de laranja</Text>
          <Text style={styles.item}>Refrigerante</Text>
          <Text style={styles.item}>Sanduíche natural</Text>
          <Text style={styles.item}>Pastel</Text>
          <Text style={styles.item}>Bolo de chocolate</Text>
          <Text style={styles.item}>Água mineral</Text>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  container: {
    flex: 1,
    paddingTop: 30,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  Menu: {
    width: '100%',
    height: '70%', // controla o espaço do scroll
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 12,
    textAlign: 'center',
  },
  item: {
    fontSize: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    color: '#4E342E',
  },
});
