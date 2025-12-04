import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../Services/supabase';
import { Alert } from 'react-native';

// Criando contexto da carteira do usuário
export const WalletContext = createContext();

export const WalletProvider = ({ usuarioId, children }) => {
  // Estados locais da carteira
  const [saldo, setSaldo] = useState(0);
  const [tickets, setTickets] = useState(0);

  // Carrega saldo e tickets do Supabase
  async function carregarCarteira() {
    try {
      const { data, error } = await supabase
        .from('carteiras')
        .select('saldo, ticket')
        .eq('usuario_id', usuarioId)
        .maybeSingle(); // retorna apenas 1 registro

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

  // Desconta saldo e atualiza no banco
  const descontarSaldo = async (valor) => {
    setSaldo((prev) => {
      const novoSaldo = prev - valor;

      supabase
        .from('carteiras')
        .update({ saldo: novoSaldo })
        .eq('usuario_id', usuarioId)
        .then(({ error }) => {
          if (error) console.error('Erro ao atualizar saldo:', error);
        });

      return novoSaldo;
    });
  };

  // Desconta tickets e salva no banco
  const descontarTickets = async (valor) => {
    setTickets((prev) => {
      const novoValor = prev - valor;

      supabase
        .from('carteiras')
        .update({ ticket: novoValor })
        .eq('usuario_id', usuarioId)
        .then(({ error }) => {
          if (error) console.error('Erro ao atualizar tickets:', error);
        });

      return novoValor;
    });
  };

  // Incrementa 1 ticket (chamado 1x por dia)
  const incrementarTicket = () => {
    setTickets((prevTickets) => {
      const novoTicket = prevTickets + 1;

      supabase
        .from('carteiras')
        .update({ ticket: novoTicket })
        .eq('usuario_id', usuarioId)
        .then(({ error }) => {
          if (error) console.error('Erro ao atualizar ticket:', error);
        });

      return novoTicket;
    });
  };

  useEffect(() => {
    if (!usuarioId) return;

    // Carrega carteira do Supabase
    carregarCarteira();

    // Incrementa 1 ticket automaticamente a cada 24h
    const intervalo = setInterval(() => {
      incrementarTicket();
    }, 24 * 60 * 60 * 1000);

    // Escuta atualizaçoes em tempo real
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

    // Limpa listeners quando componente desmonta
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
        descontarTickets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
