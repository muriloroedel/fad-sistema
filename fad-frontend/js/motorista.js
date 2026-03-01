const API = "http://localhost:4000";
const motoristaId = 1; // id do CB Aguirres

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

// ============================
// NOVA SOLICITACAO
// ============================
function mostrarNovaSolicitacao() {
  document.getElementById("conteudo").innerHTML = `
    <h2>Nova Solicitação</h2>

    <div class="card">
      <label>Placa da Viatura</label>
      <input id="placa" />

      <label>EB da Viatura</label>
      <input id="eb" />

      <label>Odômetro Atual</label>
      <input id="odometro" type="number" />

      <label>Quantidade Estimada </label>
      <input id="quantidade" type="number" max="4"/>

      <label>Tipo de Combustível</label>
      <select id="tipo_combustivel">
        <option value="Gasolina">Gasolina</option>
        <option value="Diesel">Diesel</option>
      </select>

      <label>Observações</label>
      <textarea id="obs"></textarea>

      <button class="btn-secondary" onclick="enviarSolicitacao()">Enviar</button>
    </div>
  `;
}

function enviarSolicitacao() {
  const dados = {
    motorista_id: motoristaId,
    placa_viatura: placa.value,
    eb_viatura: eb.value,
    odometro_atual: odometro.value,
    quantidade_estimada: quantidade.value,
    tipo_combustivel: document.getElementById("tipo_combustivel").value,
    observacoes: obs.value,
  };

  fetch(`${API}/solicitacoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  })
  .then(r => r.json())
  .then(() => {
    alert("Solicitação enviada com sucesso");
    listarSolicitacoes();
  });
}

// ============================
// LISTAR SOLICITAÇOES
// ============================
function listarSolicitacoes() {
  fetch(`${API}/solicitacoes?motorista_id=${motoristaId}`)
    .then(r => r.json())
    .then(lista => {
      let html = `<h2>Minhas Solicitações</h2>`;

      lista.forEach(s => {
        html += `
          <div class="card">
            <strong>Placa:</strong> ${s.placa_viatura}<br>
            <strong>Status:</strong> ${s.status}<br>
            <small>${new Date(s.criadaEm).toLocaleString()}</small><br><br>

            ${
              s.status === 'AUTORIZADA'
                ? `<button class="btn-secondary" onclick="abrirFicha(${s.id})">Ver Ficha</button>`
                : ''
            }
            ${
              s.status === 'EM_CORRECAO'
                ? `
                  <p style="color:orange;">
                    <strong>Correção solicitada:</strong><br>
                    Litros autorizados: ${s.quantidade_sugerida}<br>
                    Motivo: ${s.motivo_correcao || 'Não informado'}
                  </p>
                  <button class="btn-secondary" onclick="reenviarCorrecao(${s.id})">
                    Confirmar Correção
                  </button>
                `
                : ''
            }
            
              ${
              s.status === 'NEGADA'
              ? `<p style="color:red;"><strong>Motivo:</strong> ${s.motivo_negacao || ''}</p>`
              : ''
            }
          </div>
        `;
      });

      document.getElementById("conteudo").innerHTML = html;
    });
}

function abrirFicha(solicitacaoId) {

  fetch(`${API}/fichas?motorista_id=${motoristaId}`)
    .then(r => r.json())
    .then(lista => {

      const ficha = lista.find(f => f.solicitacao_id == solicitacaoId);

      if (!ficha) {
        alert("Ficha ainda não disponível.");
        return;
      }

      mostrarFicha(ficha);
    });
}

function mostrarFicha(ficha) {
  document.getElementById("conteudo").innerHTML = `
    <h2>Ficha de Abastecimento</h2>

    <div class="card">
      <strong>ID:</strong> ${ficha.id}<br>
      <strong>Placa:</strong> ${ficha.placa_viatura}<br>
      <strong>EB:</strong> ${ficha.eb_viatura}<br>
      <strong>OM:</strong> ${ficha.om_viatura}<br>
      <strong>Cota:</strong> ${ficha.cota}<br>
      <strong>Odômetro:</strong> ${ficha.odometro}<br>

      <strong>Criado por:</strong> ${ficha.criado_por}<br>
      <strong>Data:</strong> ${new Date(ficha.data_criacao).toLocaleString()}<br>

      <strong>Status:</strong> ${ficha.status}<br><br>

      <img src="${ficha.qrCode}" width="200"/>

      <br><br>
      <button class="btn-secondary" onclick="baixarFicha(${ficha.id})">
        Baixar Ficha
      </button>
      <br>
      <button class="btn-secondary" onclick="listarSolicitacoes()">
        Voltar
      </button>
    </div>
  `;
}

// ============================
// LISTAR SOLICITAÇOES
// ============================
function reenviarCorrecao(id) {
  fetch(`${API}/solicitacoes/${id}/correcao-confirmada`, {
    method: 'PUT'
  })
  .then(() => {
    alert("Solicitação reenviada.");
    listarSolicitacoes();
  });
}

// ============================
// DOWNLOAD DAS FICHAS
// ============================

function baixarFicha(id) {
  window.open(`${API}/fichas/${id}/download`, "_blank");
}