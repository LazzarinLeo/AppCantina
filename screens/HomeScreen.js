
import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, SafeAreaView, Image } from 'react-native';
import { supabase } from '../Services/supabase';
import produtosData from '../Services/Mock.json';

export const HomeScreen = () => {
  const [nomeUsuario, setNomeUsuario] = useState('');

  useEffect(() => {
    async function buscarNomeUsuario() {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session?.user) {
        console.log('Usuário não autenticado');
        return;
      }

      const userEmail = sessionData.session.user.email;

      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('nome')
        .eq('email', userEmail)
        .single();

      if (error) {
        console.log('Erro ao buscar nome:', error.message);
      } else {
        setNomeUsuario(usuario.nome);
      }
    }

    buscarNomeUsuario();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Cantina Escolar</Text>

        {nomeUsuario ? (
          <Text style={styles.welcome}>Bem-vindo, {nomeUsuario}!</Text>
        ) : null}

        <FlatList
          data={produtosData.produtos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.imagem }} style={styles.imagem} />
              <View style={styles.info}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.preco}>
                  R$ {Number(item.preco).toFixed(2)}
                </Text>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcome: {
    fontSize: 20,
    color: '#6D4C41',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  imagem: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  info: {
    marginLeft: 15,
    flex: 1,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6D4C41',
  },
  preco: {
    fontSize: 16,
    color: '#FFA726',
    marginTop: 4,
  },
});

