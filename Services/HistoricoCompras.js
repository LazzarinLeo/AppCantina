import { supabase } from './supabase';

//ligando função CriarHistoricoCompra a tabela do supabase

export const criarHistoricoCompra = async (user_id, total, status, payment_method) => {
  const { data, error } = await supabase
    .from('historico_compras')
    .insert([ //inserindo dados
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
//condição caso ocorra algum erro com a conexão na tabela
  if (error) {
    console.error('Erro ao criar compra:', error);
    throw error;
  }

  return data;
};
