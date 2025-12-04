import { supabase } from './supabase';
//fazendo conexão com a tabela supabase e fazendo comparação dos itens
export const adicionarItensCompra = async (compra_id, itens) => {
    const itensFormatados = itens.map(item => ({
        compra_id,
        produto_id: null,
        produto_nome: item.nome,
        quantidade: item.quantidade || 1,
        preco_unitario: item.preco,
        preco_total: item.preco * (item.quantidade || 1)
      }));      

  const { data, error } = await supabase //fazendo conexão supabase e definindo as funçoes que serão utilizados "insert" "Select"
    .from('historico_itens')
    .insert(itensFormatados)
    .select();
//caso ocorra erro no banco de dados
  if (error) {
    console.error('Erro ao registrar itens:', error);
    throw error;
  }

  return data;
};
