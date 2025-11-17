import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../Services/supabase';
import { Alert } from 'react-native';

export const WalletContext = createContext();

export const WalletProvider = ({ usuarioId, children }) => {
  const [saldo, setSaldo] = useState(0);
  const [tickets, setTickets] = useState(0);

  async function carregarCarteira() {
    try {
      const { data, error } = await supabase
        .from('carteiras')
        .select('saldo, ticket')
        .eq('usuario_id', usuarioId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSaldo(data.saldo ?? 0);
        setTickets(data.ticket ?? 0);
      }
    } catch (error) {
      console.error('Erro ao carregar carteira:', error);
      Alert.alert('Erro', 'Não foi possível carregar as informações da carteira.');
    }
  }

  const descontarSaldo = async (valor) => {
    try {
      const novoSaldo = saldo - valor;
  
      const { error } = await supabase
        .from('carteiras')
        .update({ saldo: novoSaldo })
        .eq('usuario_id', usuarioId);
  
      if (error) throw error;
  
      setSaldo(novoSaldo);
    } catch (err) {
      console.error('Erro ao descontar saldo:', err);
      Alert.alert('Erro', 'Não foi possível atualizar seu saldo.');
    }
  };
  
  const incrementarTicket = () => {
    setTickets((prevTickets) => {
      const novoTicket = prevTickets + 1;
      supabase
        .from('carteiras')
        .update({ ticket: novoTicket })
        .eq('usuario_id', usuarioId)
        .then(({ error }) => {
          if (error) console.error('Erro ao atualizar ticket no banco:', error);
        });
      return novoTicket;
    });
  };

  useEffect(() => {
    if (!usuarioId) return;

    carregarCarteira();

    const intervalo = setInterval(() => {
      incrementarTicket();
    }, 24 * 60 * 60 * 1000);

    const canal = supabase
      .channel(`carteira_realtime_${usuarioId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'carteiras',
          filter: `usuario_id=eq.${usuarioId}`,
        },
        async (payload) => {
          const novaCarteira = payload.new;
          if (novaCarteira) {
            setSaldo(novaCarteira.saldo ?? 0);
            setTickets(novaCarteira.ticket ?? 0);
          } else {
            await carregarCarteira();
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(intervalo);
      supabase.removeChannel(canal);
    };
  }, [usuarioId]);

  return (
    <WalletContext.Provider
      value={{
        saldo,
        setSaldo,
        tickets,
        setTickets,
        carregarCarteira,
        incrementarTicket,
        descontarSaldo,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
