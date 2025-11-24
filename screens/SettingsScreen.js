import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser(); // pega o usuário logado

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Configurações</Text>

      <View style={styles.option}>
        <Text style={[styles.optionText, { color: theme.colors.text }]}>
          Tema escuro
        </Text>
        <Switch
          trackColor={{ false: '#ccc', true: theme.colors.button }}
          thumbColor={theme.mode === 'dark' ? '#fff' : '#f4f3f4'}
          onValueChange={toggleTheme}
          value={theme.mode === 'dark'}
        />
      </View>

      {user?.admin && (
        <TouchableOpacity
          style={[styles.adminButton, { backgroundColor: '#e74c3c' }]}
          onPress={() => navigation.navigate('Admin')}
        >
          <Text style={[styles.adminButtonText]}>Painel Admin</Text>
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
    flexDirection: 'row',
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
