const rotas = {
  motorista: ["inicio", "solicitacao", "minhas-fichas"],
  abastecedor: ["inicio", "abastecer"],
  s4: ["inicio", "todas-solicitacoes", "relatorios"]
};

export function podeAcessar(perfil, rota) {
  return rotas[perfil]?.includes(rota);
}