import { supabase } from './supabase';

export const adicionarItensCompra = async (compra_id, itens) => {
    const itensFormatados = itens.map(item => ({
        compra_id,
        produto_id: null,
        produto_nome: item.nome,
        quantidade: item.quantidade || 1,
        preco_unitario: item.preco,
        preco_total: item.preco * (item.quantidade || 1)
      }));      

  const { data, error } = await supabase
    .from('historico_itens')
    .insert(itensFormatados)
    .select();

  if (error) {
    console.error('Erro ao registrar itens:', error);
    throw error;
  }

  return data;
};
