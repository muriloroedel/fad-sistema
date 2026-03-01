
export function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("usuario"));
}

export function loginSimulado(perfil) {
  const usuario = {
    nome: perfil.toUpperCase(),
    perfil: perfil
  };

  localStorage.setItem("usuario", JSON.stringify(usuario));
}

export function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}
