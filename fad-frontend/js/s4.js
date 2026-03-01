const API = "http://localhost:4000";

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

// =============================
// LISTAR SOLICITAÇOES
// =============================
function listarSolicitacoes() {
  fetch(`${API}/solicitacoes`)
    .then(r => r.json())
    .then(lista => {

      let html = `<h2>Solicitações</h2>`;

      lista.forEach(s => {

        html += `
          <div class="card">
            <strong>ID:</strong> ${s.id}<br>
            <strong>Motorista:</strong> ${s.motorista_id}<br>
            <strong>Placa:</strong> ${s.placa_viatura}<br>
            <strong>EB:</strong> ${s.eb_viatura}<br>
            <strong>Odômetro:</strong> ${s.odometro_atual} KM<br>
            <strong>Quantidade:</strong> ${s.quantidade_solicitada} Litros<br>
            <strong>Combustível:</strong> ${s.tipo_combustivel}<br>
            <strong>Status:</strong> ${s.status}<br>
            <strong>Observações:</strong> ${s.observacoes || "-"}<br><br>
        `;

        // BOTOES APENAS PARA PENDENTE
        if (s.status === "PENDENTE" || s.status === "PENDENTE_CORRIGIDA") {
          if (s.status === "PENDENTE_CORRIGIDA") {
            html += `
              <p style="color:green;">
                <strong>Correção aceita pelo motorista</strong><br>
                Quantidade ajustada: ${s.quantidade_solicitada} Litros
              </p>
            `;
          }
          html += `
            <button class="btn-secondary"
              onclick="abrirCriarFicha(${s.id})">
              Autorizar
            </button>

            <button class="btn-secondary"
              onclick="negar(${s.id})">
              Negar
            </button>

            <button class="btn-secondary" 
              onclick="solicitarCorrecao(${s.id})">
              Enviar para Correção
            </button>
          `;
        }

        // MOSTRAR CORREÇAO
        if (s.status === "EM_CORRECAO") {
          html += `
            <p style="color:orange;">
              <strong>Aguardando confirmação do motorista</strong><br>
              Quantidade autorizada: ${s.quantidade_solicitada}<br>
              Motivo: ${s.motivo_correcao || "Não informado"}
            </p>
          `;
        }

        // MOSTRAR NEGADA
        if (s.status === "NEGADA") {
          html += `
            <p style="color:red;">
              <strong>Negada</strong><br>
              Motivo: ${s.motivo_negacao || "Não informado"}
            </p>
          `;
        }

        html += `</div>`;
      });

      document.getElementById("conteudo").innerHTML = html;
    });
}

// =============================
// NEGAR SOLICITAÇAO
// =============================
function negar(id) {

  const motivo = prompt("Motivo da negação:");
  if (!motivo) return;

  fetch(`${API}/solicitacoes/${id}/negar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motivo })
  })
  .then(() => {
    alert("Solicitação negada.");
    listarSolicitacoes();
  });
}

// =============================
// ENVIAR PARA CORREÇAO
// =============================
function solicitarCorrecao(id) {

  const litros = Number(prompt("Quantidade autorizada:"));
  if (!litros) return;

  const motivo = prompt("Motivo da correção:");

  fetch(`${API}/solicitacoes/${id}/correcao`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quantidade_sugerida: litros,
      motivo: motivo || ""
    })
  })
  .then(() => {
    alert("Solicitação enviada para correção.");
    listarSolicitacoes();
  });
}

// =============================
// FORMULÁRIO DE CRIAÇAO DA FICHA
// =============================
function abrirCriarFicha(solicitacao_id) {

  document.getElementById("conteudo").innerHTML = `
    <h2>Criar Ficha de Abastecimento</h2>

    <div class="card">
      <label>OM da Viatura</label>
      <input id="om" />

      <label>Quantidade Final (Litros)</label>
      <input id="quantidade_final" type="number" />

      <label>Cota</label>
      <input id="cota" value="Mensal" />

      <label>Autorizador</label>
      <input id="autorizador" value="S4" />

      <br><br>
      <button class="btn-secondary" onclick="criarFicha(${solicitacao_id})">
        Confirmar Autorização
      </button>

      <button class="btn-secondary" onclick="listarSolicitacoes()">
        Cancelar
      </button>
    </div>
  `;
}

// =============================
// CRIAR FICHA
// =============================
function criarFicha(solicitacao_id) {

  const dados = {
    solicitacao_id: solicitacao_id,
    om_viatura: document.getElementById("om").value,
    quantidade_final: Number(document.getElementById("quantidade_final").value),
    cota: document.getElementById("cota").value,
    autorizador: document.getElementById("autorizador").value
  };

  fetch(`${API}/fichas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  })
  .then(r => r.json())
  .then(res => {

    if (res.erro) {
      alert(res.erro);
      return;
    }

    alert("Ficha criada com sucesso.");
    listarFichas();
  });
}

// =============================
// LISTAR FICHAS
// =============================
function listarFichas() {
  fetch(`${API}/fichas`)
    .then(r => r.json())
    .then(lista => {

      let html = `<h2>Fichas Criadas</h2>`;

      lista.forEach(f => {
        html += `
          <div class="card">
            <strong>ID:</strong> ${f.id}<br>
            <strong>Placa:</strong> ${f.placa_viatura}<br>
            <strong>Combustível:</strong> ${f.tipo_combustivel}<br>
            <strong>Status:</strong> ${f.status}<br><br>

            <button class="btn-secondary" onclick="verFicha(${f.id})">
              Ver Detalhes
            </button>

            <button class="btn-secondary" onclick="baixarFicha(${f.id})">
              Baixar ficha em PDF
            </button>
          </div>
        `;
      });

      document.getElementById("conteudo").innerHTML = html;
    });
}

// =============================
// VER FICHA
// =============================
function verFicha(id) {
  fetch(`${API}/fichas/${id}`)
    .then(r => r.json())
    .then(f => {

      document.getElementById("conteudo").innerHTML = `
        <h2>Detalhes da Ficha</h2>
        <div class="card">

          <strong>ID:</strong> ${f.id}<br>
          <strong>Placa:</strong> ${f.placa_viatura}<br>
          <strong>EB:</strong> ${f.eb_viatura}<br>
          <strong>Motorista:</strong> ${f.motorista_nome}<br>
          <strong>Odômetro:</strong> ${f.odometro}km<br>
          <strong>OM:</strong> ${f.om_viatura}<br>
          <strong>Cota:</strong> ${f.cota}<br>

          <strong>Criado por:</strong> ${f.criado_por}<br>
          <strong>Data:</strong> ${new Date(f.data_criacao).toLocaleString()}<br>
          <strong>Quantidade:</strong> ${f.quantidade_final} Litros<br>
          <strong>Status:</strong> ${f.status}<br><br>

          <img src="${f.qrCode}" width="180"/>

          <br><br>
          <button class="btn-secondary" onclick="listarFichas()">
            Voltar
          </button>
        </div>
      `;
    });
}

function baixarFicha(id) {
  window.open(`${API}/fichas/${id}/download`, "_blank");
}