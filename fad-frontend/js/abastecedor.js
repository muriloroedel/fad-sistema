const API = "http://localhost:4000";

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

// =============================
// LISTAR FICHAS AUTORIZADAS
// =============================
async function carregarFichas() {

  const conteudo = document.getElementById("conteudo");
  conteudo.innerHTML = "<h2>Fichas Autorizadas</h2><p>Carregando...</p>";

  try {
    const res = await fetch(`${API}/fichas`);
    const fichas = await res.json();

    const autorizadas = fichas.filter(f => f.status === "AUTORIZADA");

    if (autorizadas.length === 0) {
      conteudo.innerHTML = `
        <h2>Fichas Autorizadas</h2>
        <p>Nenhuma ficha disponível.</p>
      `;
      return;
    }

    let html = `<h2>Fichas Autorizadas</h2>`;

    autorizadas.forEach(f => {
      html += `
        <div class="card">
          <p><strong>Ficha:</strong> ${f.id}</p>
          <p><strong>OM:</strong> ${f.om_viatura}</p>
          <p><strong>EB:</strong> ${f.eb_viatura}</p>
          <p><strong>Placa:</strong> ${f.placa_viatura}</p>
          <p><strong>Motorista:</strong> ${f.motorista_nome}</p>
          <p><strong>Quantidade:</strong> ${f.quantidade_final} L</p>
          <button class="btn-secondary" onclick="mostrarFormulario(${f.id})">
            Abastecer
          </button>
        </div>
      `;
    });

    conteudo.innerHTML = html;

  } catch (erro) {
    conteudo.innerHTML = "<p>Erro ao carregar fichas.</p>";
  }
}

// =============================
// MOSTRAR FORMULÁRIO
// =============================
async function mostrarFormulario(id) {

  const res = await fetch(`${API}/fichas/${id}`);
  const ficha = await res.json();

  const conteudo = document.getElementById("conteudo");

  conteudo.innerHTML = `
    <h2>Registrar Abastecimento</h2>

    <div class="card">
      <p><strong>OM:</strong> ${ficha.om_viatura}</p>
      <p><strong>EB:</strong> ${ficha.eb_viatura}</p>
      <p><strong>Placa:</strong> ${ficha.placa_viatura}</p>
      <p><strong>Motorista:</strong> ${ficha.motorista_nome}</p>
      <p><strong>Quantidade Autorizada:</strong> ${ficha.quantidade_final} L</p>
    </div>

    <div class="card">
      <form onsubmit="registrarAbastecimento(event, ${ficha.id})">
        <label>Odômetro Confirmado</label>
        <input type="number" id="odometroConfirmado" required>

        <label>Quantidade Abastecida (L)</label>
        <input type="number" step="0.01" id="quantidadeAbastecida" required>

        <button type="submit" class="btn-secondary">
          Confirmar Abastecimento
        </button>
      </form>
    </div>
  `;
}

// =============================
// REGISTRAR ABASTECIMENTO
// =============================
async function registrarAbastecimento(event, id) {

  event.preventDefault();

  const dados = {
    odometroConfirmado: document.getElementById("odometroConfirmado").value,
    quantidadeAbastecida: document.getElementById("quantidadeAbastecida").value,
    nomeAbastecedor: "Abastecedor"
  };

  const res = await fetch(`${API}/fichas/${id}/abastecer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });

  const resposta = await res.json();

  if (res.ok) {
    alert("Abastecimento registrado com sucesso!");
    carregarFichas();
  } else {
    alert(resposta.erro || "Erro ao registrar.");
  }
}