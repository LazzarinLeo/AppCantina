import React, { createContext, useState } from 'react';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [saldo, setSaldo] = useState(100);

  return (
    <WalletContext.Provider value={{ saldo, setSaldo }}>
      {children}
    </WalletContext.Provider>
  );
};
