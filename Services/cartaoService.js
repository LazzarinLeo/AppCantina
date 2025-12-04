import { supabase } from './supabase';

//função para identificar bandeira do cartão automaticamente 
export function detectarBandeira(numero) {
  const n = numero;
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "American Express";
  if (/^6/.test(n)) return "Discover";
  if (/^3(0|6|8)/.test(n)) return "Diners";
  return "Desconhecida";
}
export async function adicionarCartao(payload) {
  return await supabase.from("cartoes").insert(payload);
}
//função que linka a add do cartao e lista no supa base diretamente para assim salvar o cartao
export async function listarCartoes(usuarioId) {
  return await supabase
    .from("cartoes")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("criado_em", { ascending: false });
}
//função para remover o cartao
export async function removerCartao(id) {
  return await supabase.from("cartoes").delete().eq("id", id);
}
