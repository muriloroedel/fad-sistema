const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const app = express();
app.use(cors());
app.use(express.json());

console.log("Servidor FAD iniciado");

let solicitacoes = [];
let fichas = [];
let motoristas = [
  { id: 1, nome: "CB Aguirres"}
];

// =======================
// TESTE
// =======================
app.get('/', (req, res) => {
  res.send('Servidor FAD rodando');
});

// =======================
// DOWNLOAD DE FICHA 
// =======================
app.get("/fichas/:id/download", (req, res) => {

  try {

    const ficha = fichas.find(f => f.id == req.params.id);

    if (!ficha) {
      return res.status(404).json({ erro: "Ficha não encontrada" });
    }

    if (ficha.status !== "AUTORIZADA") {
      return res.status(400).json({
        erro: "Ficha ainda não autorizada"
      });
    }

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Ficha_${ficha.id}.pdf`
    );

    doc.pipe(res);

    // =========================
    // BORDA EXTERNA
    // =========================
    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
       .lineWidth(2)
       .stroke();

    // =========================
    // TÍTULO
    // =========================
    doc.moveDown();
    doc.fontSize(16)
       .font("Helvetica-Bold")
       .text("FICHA DE ABASTECIMENTO DIGITAL", { align: "center" });

    doc.moveDown(0.5);

    doc.fontSize(13)
       .font("Helvetica-Bold")
       .text("AUTORIZAÇÃO DE ABASTECIMENTO DE VIATURA", { align: "center" });

    doc.moveDown(2);

    // =========================
    // DADOS ORGANIZADOS EM COLUNA
    // =========================
    doc.fontSize(12).font("Helvetica");

    const startX = 80;
    let posY = doc.y;

    function linha(label, valor) {
      doc.font("Helvetica-Bold").text(label, startX, posY);
      doc.font("Helvetica").text(valor || "-", startX + 200, posY);
      posY += 25;
    }

    linha("OM da Viatura:", ficha.om_viatura);
    linha("EB da Viatura:", ficha.eb_viatura);
    linha("Placa:", ficha.placa_viatura);
    linha("Motorista:", ficha.motorista_nome);
    linha("Odômetro Atual:", `${ficha.odometro} Km`);
    linha("Quantidade Autorizada:", `${ficha.quantidade_final} Litros`);
    linha("Tipo de Combustível:", ficha.tipo_combustivel);
    linha("Cota:", ficha.cota);
    linha("Autorizado por:", ficha.autorizado_por);
    linha("Data/Hora:", new Date(ficha.data_autorizacao).toLocaleString());

    // =========================
    // LINHA SEPARADORA
    // =========================
    doc.moveTo(80, posY + 10)
       .lineTo(doc.page.width - 80, posY + 10)
       .stroke();

    posY += 30;

    // =========================
    // QR CODE CENTRALIZADO
    // =========================
    if (ficha.qrCode) {
      const qrBase64 = ficha.qrCode.split("base64,")[1];
      const qrBuffer = Buffer.from(qrBase64, "base64");

      doc.font("Helvetica-Bold")
         .text("Validação via QR Code:", 0, posY, { align: "center" });

      doc.image(qrBuffer, doc.page.width / 2 - 60, posY + 20, {
        width: 120
      });
    }

    // =========================
    // RODAPÉ INSTITUCIONAL AJUSTADO
    // =========================
    // =========================
// RODAPÉ SEGURO
// =========================

doc.fontSize(10);
doc.font("Helvetica-Oblique");

// Posição fixa segura acima da margem
const footerY = doc.page.height - 80;

// Desenhar linha separadora
doc.moveTo(50, footerY - 10)
   .lineTo(doc.page.width - 50, footerY - 10)
   .stroke();

// Texto centralizado
doc.text(
  "Documento gerado automaticamente pelo Sistema FAD",
  50,
  footerY,
  {
    width: doc.page.width - 100,
    align: "center"
  }
);

doc.text(
  "Desenvolvido pelo 3º SGT RÖEDEL",
  50,
  footerY + 12,
  {
    width: doc.page.width - 100,
    align: "center"
  }
);

  doc.end();

  } catch (error) {

    console.error("Erro ao gerar PDF:", error);

    if (!res.headersSent) {
      res.status(500).json({ erro: "Erro ao gerar PDF" });
    }
  }
});

// =======================
// SOLICITAÇÕES
// =======================
app.post('/solicitacoes', (req, res) => {

  const {
    motorista_id,
    placa_viatura,
    eb_viatura,
    odometro_atual,
    quantidade_estimada,
    tipo_combustivel,
    observacoes
  } = req.body;

  if (!motorista_id || !placa_viatura || !eb_viatura || !odometro_atual) {
    return res.status(400).json({ erro: 'Dados obrigatórios não informados' });
  }

  const solicitacao = {
    id: Date.now(),
    motorista_id,
    placa_viatura,
    eb_viatura,
    odometro_atual,
    quantidade_solicitada: quantidade_estimada,
    tipo_combustivel,
    observacoes,
    status: 'PENDENTE',
    criadaEm: new Date()
  };

  solicitacoes.push(solicitacao);
  res.status(201).json(solicitacao);
});

app.get('/solicitacoes', (req, res) => {

  const { motorista_id } = req.query;

  if (motorista_id) {
    return res.json(
      solicitacoes.filter(s => s.motorista_id == motorista_id)
    );
  }

  res.json(solicitacoes);
});

// =======================
// FICHAS
// =======================
app.post('/fichas', async (req, res) => {

  const { solicitacao_id, om_viatura, quantidade_final, cota, autorizador } = req.body;

  const solicitacao = solicitacoes.find(s => s.id == solicitacao_id);

  if (!solicitacao) {
    return res.status(404).json({ erro: 'Solicitação não encontrada' });
  }
  const statusPermitidos = ['PENDENTE', 'PENDENTE_CORRIGIDA'];

  if (!statusPermitidos.includes(solicitacao.status)) {
    return res.status(400).json({
      erro: 'Solicitação não está disponível para autorização'
    });
  }

  if (!om_viatura) {
    return res.status(400).json({ erro: "OM da viatura é obrigatória" });
  }

  if (!quantidade_final || quantidade_final <= 0) {
    return res.status(400).json({ erro: "Quantidade final inválida" });
  }

  const id = Date.now();

  const qrCode = await QRCode.toDataURL(
    `http://localhost:4000/fichas/${id}`
  );

  const motorista = motoristas.find(m => m.id == solicitacao.motorista_id);

  const ficha = {
    id,
    solicitacao_id,
    motorista_id: solicitacao.motorista_id,
    motorista_nome: motorista ? motorista.nome : "Não encontrado",
    placa_viatura: solicitacao.placa_viatura,
    eb_viatura: solicitacao.eb_viatura,
    odometro: solicitacao.odometro_atual,
    om_viatura,
    cota,
    quantidade_final,
    tipo_combustivel: solicitacao.tipo_combustivel,
    autorizado_por: autorizador || "S4",
    data_autorizacao: new Date().toISOString(),
    status: 'AUTORIZADA',
    qrCode
  };

  fichas.push(ficha);
  solicitacao.status = 'AUTORIZADA';

  res.status(201).json(ficha);
});

app.get('/fichas', (req, res) => {

  const { motorista_id } = req.query;

  if (motorista_id) {
    return res.json(
      fichas.filter(f => f.motorista_id == motorista_id)
    );
  }

  res.json(fichas);
});

app.get('/fichas/:id', (req, res) => {

  const ficha = fichas.find(f => f.id == req.params.id);

  if (!ficha) {
    return res.status(404).json({ erro: 'Ficha não encontrada' });
  }

  res.json(ficha);
});
// =======================
// NEGAR SOLICITAÇÃO
// =======================
app.put('/solicitacoes/:id/negar', (req, res) => {

  const { motivo } = req.body;

  const solicitacao = solicitacoes.find(s => s.id == req.params.id);

  if (!solicitacao) {
    return res.status(404).json({ erro: 'Solicitação não encontrada' });
  }

  solicitacao.status = 'NEGADA';
  solicitacao.motivo_negacao = motivo || "Não informado";

  res.json({ mensagem: "Solicitação negada com sucesso" });
});

// =======================
// ENVIAR PARA CORREÇÃO
// =======================
app.put('/solicitacoes/:id/correcao', (req, res) => {

  const { quantidade_sugerida, motivo } = req.body;

  const solicitacao = solicitacoes.find(s => s.id == req.params.id);

  if (!solicitacao) {
    return res.status(404).json({ erro: 'Solicitação não encontrada' });
  }

  if (!quantidade_sugerida || quantidade_sugerida <= 0) {
    return res.status(400).json({ erro: 'Quantidade inválida' });
  }

  solicitacao.status = 'EM_CORRECAO';
  solicitacao.quantidade_sugerida = quantidade_sugerida;
  solicitacao.motivo_correcao = motivo || "";

  res.json({ mensagem: "Solicitação enviada para correção" });
});

// =======================
// CONFIRMAR CORREÇÃO PELO MOTORISTA
// =======================
app.put('/solicitacoes/:id/correcao-confirmada', (req, res) => {

  const solicitacao = solicitacoes.find(s => s.id == req.params.id);

  if (!solicitacao) {
    return res.status(404).json({ erro: 'Solicitação não encontrada' });
  }

  if (solicitacao.status !== 'EM_CORRECAO') {
    return res.status(400).json({ erro: 'Solicitação não está em correção' });
  }

  solicitacao.status = 'PENDENTE_CORRIGIDA';

  if (solicitacao.quantidade_sugerida) {
    solicitacao.quantidade_solicitada = solicitacao.quantidade_sugerida;
    delete solicitacao.quantidade_sugerida;
  }

  res.json({ mensagem: "Correção confirmada. Aguardando nova autorização." });
});

// =======================
// REGISTRAR ABASTECIMENTO
// =======================
app.put('/fichas/:id/abastecer', (req, res) => {

  const ficha = fichas.find(f => f.id == req.params.id);

  if (!ficha) {
    return res.status(404).json({ erro: "Ficha não encontrada" });
  }

  if (ficha.status !== "AUTORIZADA") {
    return res.status(400).json({
      erro: "Somente fichas autorizadas podem ser abastecidas"
    });
  }

  const {
    odometroConfirmado,
    quantidadeAbastecida,
    nomeAbastecedor
  } = req.body;

  if (!odometroConfirmado || !quantidadeAbastecida) {
    return res.status(400).json({
      erro: "Dados de abastecimento incompletos"
    });
  }

  ficha.odometro_confirmado = odometroConfirmado;
  ficha.quantidade_abastecida = quantidadeAbastecida;
  ficha.abastecedor = nomeAbastecedor;
  ficha.data_abastecimento = new Date().toISOString();
  ficha.status = "ABASTECIDA";

  res.json({ mensagem: "Abastecimento registrado com sucesso" });
});

// =======================
// INICIAR SERVIDOR
// =======================
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

