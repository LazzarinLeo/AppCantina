import { supabase } from './supabase';
import Produtos from './Mock.json';

//  Envia os produtos do Mock.json para o Supabase (sem o campo id)
export const uploadMockToSupabase = async () => {
  try {
    const { count } = await supabase
      .from('produtos')
      .select('*', { count: 'exact', head: true });

    if (count > 0) {
      console.log('🟡 A tabela já tem produtos — nada inserido.');
      return;
    }

    const produtosSemId = Produtos.map(({ id, ...rest }) => rest);

    const { data, error } = await supabase
      .from('produtos')
      .insert(produtosSemId);

    if (error) {
      console.error('❌ Erro ao enviar produtos:', error);
      return null;
    }

    console.log('✅ Produtos inseridos com sucesso:', data);
    return data;
  } catch (err) {
    console.error('⚠️ Erro inesperado:', err);
  }
};

//  Busca os produtos diretamente do banco
export const getProdutos = async () => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('⚠️ Erro inesperado:', err);
    return [];
  }
};
