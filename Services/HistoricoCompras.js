import { supabase } from './supabase';

export const criarHistoricoCompra = async (user_id, total, status, payment_method) => {
  const { data, error } = await supabase
    .from('historico_compras')
    .insert([
      {
        user_id,
        total,
        status,
        payment_method,
        created_at: new Date(),
        paid_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar compra:', error);
    throw error;
  }

  return data;
};
