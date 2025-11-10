import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../Services/supabase';
import { Alert } from 'react-native';

export const WalletContext = createContext();

export const WalletProvider = ({ usuarioId, children }) => {
  const [saldo, setSaldo] = useState(0);

  async function carregarSaldo() {
    try {
      const { data, error } = await supabase
        .from('carteiras')
        .select('saldo')
        .eq('usuario_id', usuarioId)
        .single();

      if (error) throw error;
      setSaldo(data?.saldo ?? 0);
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
      Alert.alert('Erro', 'Não foi possível carregar o saldo.');
    }
  }

  useEffect(() => {
    if (usuarioId) carregarSaldo();
  }, [usuarioId]);

  return (
    <WalletContext.Provider value={{ saldo, setSaldo, carregarSaldo }}>
      {children}
    </WalletContext.Provider>
  );
};
