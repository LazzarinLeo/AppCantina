// Tela de configurações da aplicação

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';

import { useTheme } from '../contexts/ThemeContext'; // tema claro/escuro
import { useUser } from '../contexts/UserContext';   // usuário logado

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme } = useTheme(); // toggleTheme alterna entre dark/light
  const { user } = useUser();                // captura dados do usuário atual

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Título da tela */}
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Configurações
      </Text>

      {/* Alternância do tema claro/escuro */}
      <View style={styles.option}>
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          Tema escuro
        </Text>

        <Switch
          trackColor={{ false: '#ccc', true: theme.colors.button }}
          thumbColor={theme.mode === 'dark' ? '#fff' : '#f4f3f4'}
          onValueChange={toggleTheme}   // muda entre dark e light
          value={theme.mode === 'dark'} // indica se o tema está escuro
        />
      </View>

      {/* Botão exclusivo para administradores */}
      {user?.admin && (
        <TouchableOpacity
          style={[styles.adminButton, { backgroundColor: '#e74c3c' }]}
          onPress={() => navigation.navigate('Admin')}
        >
          <Text style={styles.adminButtonText}>Painel Admin</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  option: {
    flexDirection: 'row',           // texto + switch lado a lado
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  optionText: {
    fontSize: 18,
  },

  adminButton: {
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  adminButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
