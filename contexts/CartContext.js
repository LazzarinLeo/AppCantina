import React, { createContext, useState, useContext } from 'react';
import { WalletContext } from './WalletContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { saldo, setSaldo } = useContext(WalletContext);

  const addToCart = (produto) => {
    setCartItems(prev => [...prev, produto]);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const checkout = () => {
    const total = cartItems.reduce((acc, item) => acc + item.preco, 0);
    if(total > saldo){
      alert('Saldo insuficiente!');
      return false;
    }
    setSaldo(saldo - total);
    clearCart();
    alert('Compra realizada com sucesso!');
    return true;
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
};
