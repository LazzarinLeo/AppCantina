import React, { createContext, useState, useContext } from 'react';
import { WalletContext } from './WalletContext';

// Criando o contexto do carrinho
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Lista de itens no carrinho
  const [cartItems, setCartItems] = useState([]);

  // Pegando saldo da carteira para validar compra
  const { saldo, setSaldo } = useContext(WalletContext);

  // Função para gerar ID único para cada item colocado no carrinho
  const gerarIdUnico = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 5);

  // Adiciona um produto ao carrinho com um ID exclusivo
  const addToCart = (produto) => {
    const itemComIdUnico = { ...produto, cartId: gerarIdUnico() };
    setCartItems((prev) => [...prev, itemComIdUnico]);
  };

  // Remove item específico do carrinho pelo ID
  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  // Limpa completamente o carrinho
  const clearCart = () => {
    setCartItems([]);
  };

  // Finaliza compra, desconta saldo e limpa carrinho
  const checkout = () => {
    const total = cartItems.reduce((acc, item) => acc + item.preco, 0);

    // Verifica saldo insuficiente
    if (total > saldo) {
      alert('Saldo insuficiente!');
      return false;
    }

    // Desconta saldo e limpa carrinho
    setSaldo(saldo - total);
    clearCart();

    alert('Compra realizada com sucesso!');
    return true;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        checkout,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
