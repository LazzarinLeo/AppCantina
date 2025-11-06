import React, { createContext, useState, useContext } from 'react';
import { WalletContext } from './WalletContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { saldo, setSaldo } = useContext(WalletContext);

  const gerarIdUnico = () => Date.now().toString() + Math.random().toString(36).substr(2, 5);

  const addToCart = (produto) => {
    const itemComIdUnico = { ...produto, cartId: gerarIdUnico()}
    setCartItems ((prev) => [ ...prev, itemComIdUnico]);
  };

  const removeFromCart = (cartId) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () =>{
     setCartItems([]);
    }

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
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, checkout, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
