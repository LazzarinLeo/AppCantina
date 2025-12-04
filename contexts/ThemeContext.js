import React, { createContext, useState, useContext } from 'react';

// Criando contexto para tema claro/escuro
const ThemeContext = createContext();

// Tema claro
const lightTheme = {
  mode: 'light',
  colors: {
    background: '#ffe8e0',
    text: '#6D4C41',
    card: '#FFFFFF',
    border: '#D7CCC8',
    inputBackground: '#FFFFFF',
    placeholder: '#A1887F',
    button: '#FF7043',
    buttonText: '#FFFFFF',
    link: '#6D4C41',
    highlight: '#FF7043',
    tabBarBackground: '#FFFFFF',
    tabBarActive: '#009688',
    tabBarInactive: '#999',
  },
};

// Tema escuro
const darkTheme = {
  mode: 'dark',
  colors: {
    background: '#121212',
    text: '#E0E0E0',
    card: '#1E1E1E',
    border: '#333',
    inputBackground: '#2C2C2C',
    placeholder: '#BCAAA4',
    button: '#703dff',
    buttonText: '#FFFFFF',
    link: '#D7CCC8',
    highlight: '#FFAB91',
    tabBarBackground: '#1E1E1E',
    tabBarActive: '#80CBC4',
    tabBarInactive: '#757575',
  },
};

export const ThemeProvider = ({ children }) => {
  // Estado inicial: tema claro
  const [theme, setTheme] = useState(lightTheme);

  // Alterna entre claro e escuro
  const toggleTheme = () => {
    setTheme((prev) => (prev.mode === 'light' ? darkTheme : lightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar tema facilmente em qualquer tela
export const useTheme = () => useContext(ThemeContext);
