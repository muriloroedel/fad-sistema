document
  .getElementById("formSolicitacao")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectViatura = document.getElementById("viatura");
    const option = selectViatura.selectedOptions[0];

    // Monta o objeto exatamente como o BACKEND espera
    const dados = {
      motorista: document.getElementById("motoristaId").value,
      viatura: selectViatura.value,
      placaViatura: option.dataset.placa,
      omViatura: option.dataset.om,
      odometroAtual: document.getElementById("odometro").value,
      quantidadeEstimada: document.getElementById("quantidade").value,
      observacoes: document.getElementById("observacoes").value
    };

    try {
      const res = await fetch("http://localhost:4000/solicitacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      });

      if (!res.ok) {
        const erro = await res.json();
        throw erro;
      }

      alert("Solicitação enviada com sucesso!");
      e.target.reset();

    } catch (err) {
      alert("Erro ao enviar solicitação");
      console.error("Erro:", err);
    }
  });