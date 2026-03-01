
import { getUsuarioLogado, logout } from "./auth.js";
import { podeAcessar } from "./router.js";

const usuario = getUsuarioLogado();

if (!usuario) {
  window.location.href = "login.html";
}

document.querySelector(".user-name").innerText = usuario.nome;

// Controle do menu lateral
document.querySelectorAll(".sidebar li").forEach(item => {
  const rota = item.dataset.rota;

  if (!podeAcessar(usuario.perfil, rota)) {
    item.style.display = "none";
  }

  item.addEventListener("click", () => {
    carregarTela(rota);
  });
});

document.querySelector(".btn-secondary").onclick = logout;

function carregarTela(rota) {
  if (!podeAcessar(usuario.perfil, rota)) {
    alert("Acesso negado");
    return;
  }

  fetch(`views/${rota}.html`)
    .then(res => res.text())
    .then(html => {
      document.querySelector(".content").innerHTML = html;
    });
}
