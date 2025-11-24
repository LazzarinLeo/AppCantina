import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

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

const darkTheme = {
  mode: 'dark',
  colors: {
    background: '#121212',
    text: '#E0E0E0',
    card: '#1E1E1E',
    border: '#333',
    inputBackground: '#2C2C2C',
    placeholder: '#BCAAA4',
    button: '#FF7043',
    buttonText: '#FFFFFF',
    link: '#D7CCC8',
    highlight: '#FFAB91',
    tabBarBackground: '#1E1E1E',
    tabBarActive: '#80CBC4',
    tabBarInactive: '#757575',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme); 

  const toggleTheme = () => {
    setTheme(prev => (prev.mode === 'light' ? darkTheme : lightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
