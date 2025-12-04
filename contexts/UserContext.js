import React, { createContext, useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Criando contexto do usuário
export const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // Estado do usuário logado (ou null)
  const [user, setUser] = useState(null);

  // Salva dados do usuário ao logar
  const login = (userData) => {
    setUser(userData);
  };

  // Remove usuário ao deslogar
  const logout = () => {
    setUser(null);
  };

  // Caso o usuário esteja bloqueado (ativo = false)
  if (user && user.ativo === true) {
    return (
      <View style={styles.blockedContainer}>
        <Text style={styles.blockedText}>
          Sua conta está desativada pelo administrador.
        </Text>

        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Renderiza app normalmente
  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

const styles = StyleSheet.create({
  blockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  blockedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
