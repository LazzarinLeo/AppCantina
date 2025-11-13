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
        .select('saldo, ticket, ultima_atualizacao')
        .eq('usuario_id', usuarioId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const agora = new Date();
        const ultimaAtualizacao = data.ultima_atualizacao
          ? new Date(data.ultima_atualizacao)
          : agora;
          
        const minutosPassados = Math.floor(
          (agora - ultimaAtualizacao) / (1000 * 60 * 60 * 24)
        );

        const novoTicket = (data.ticket ?? 0) + minutosPassados;
        setTickets(novoTicket);
        setSaldo(data.saldo ?? 0);

        if (minutosPassados > 0) {
          await supabase
            .from('carteiras')
            .update({ ticket: novoTicket, ultima_atualizacao: agora })
            .eq('usuario_id', usuarioId);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar carteira:', error);
      Alert.alert('Erro', 'Não foi possível carregar a carteira.');
    }
  }

  const incrementarTicket = async () => {
    const novoTicket = tickets + 1;
    setTickets(novoTicket);

    try {
      await supabase
        .from('carteiras')
        .update({ ticket: novoTicket, ultima_atualizacao: new Date() })
        .eq('usuario_id', usuarioId);
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error);
    }
  };

  useEffect(() => {
    if (!usuarioId) return;

    carregarCarteira();

    // Intervalo de 1 minuto
    const intervalo = setInterval(() => {
      incrementarTicket();
    }, 60 * 1000);

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
        (payload) => {
          const novaCarteira = payload.new;
          if (novaCarteira) {
            setSaldo(novaCarteira.saldo ?? 0);
            setTickets(novaCarteira.ticket ?? 0);
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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
