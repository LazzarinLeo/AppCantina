import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();

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
});
