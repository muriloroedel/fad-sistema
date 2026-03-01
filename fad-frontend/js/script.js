function login() {
    const perfil = document.getElementById('perfil').value;

    if (!perfil) {
        alert('Selecione um perfil');
        return;
    }

    localStorage.setItem('perfil', perfil);

    if (perfil === 'S4') {
        window.location.href = 's4.html';
    } else if (perfil === 'MOTORISTA') {
        window.location.href = 'motorista.html';
    } else if (perfil === 'ABASTECEDOR') {
        window.location.href = 'abastecedor.html';
    }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// Proteção de tela
function protegerTela(perfisPermitidos) {
    const perfil = localStorage.getItem('perfil');

    if (!perfil || !perfisPermitidos.includes(perfil)) {
        alert('Acesso não autorizado');
        window.location.href = 'login.html';
    }
}
