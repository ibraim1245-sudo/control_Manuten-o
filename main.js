async function carregarDados() {
    const ativos = await eel.listar_ferramentas()();
    
    // Atualizar Números
    document.getElementById('count-total').innerText = ativos.length;
    const ops = ativos.filter(a => a.status === 'Operacional').length;
    document.getElementById('count-op').innerText = ops;
    document.getElementById('count-manut').innerText = ativos.length - ops;

    // Barra de Saúde
    const saude = ativos.length > 0 ? Math.round((ops / ativos.length) * 100) : 0;
    document.getElementById('health-bar').style.width = saude + "%";
    document.getElementById('health-label').innerText = saude + "% da Planta Funcional";

    // Tabela
    const tbody = document.getElementById('lista-corpo');
    tbody.innerHTML = "";
    ativos.forEach((a, index) => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${a.nome}</strong></td>
                <td>${a.serial}</td>
                <td>${a.prioridade}</td>
                <td><span style="color:${a.status === 'Operacional' ? 'green' : 'orange'}">● ${a.status}</span></td>
                <td><button onclick="remover(${index})" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
    });
}

async function cadastrar() {
    const nome = document.getElementById('name').value;
    const serial = document.getElementById('serial').value || 'S/N';
    const prio = document.getElementById('priority').value;
    const status = document.getElementById('status').value;

    if (nome) {
        await eel.salvar_ferramenta({ nome, serial, prioridade: prio, status, data: new Date().toLocaleDateString() })();
        document.getElementById('name').value = "";
        toggleModal(false);
        carregarDados();
    }
}

function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).style.display = 'block';
    document.getElementById('btn-' + tab).classList.add('active');
    carregarDados();
}

async function remover(idx) {
    if (confirm("Excluir este ativo?")) {
        await eel.excluir_ferramenta(idx)();
        carregarDados();
    }
}

function toggleModal(show) {
    document.getElementById('modal-form').style.display = show ? 'block' : 'none';
}

window.onload = () => {
    document.getElementById('date-display').innerText = new Date().toLocaleDateString('pt-br', { weekday:'long', day:'numeric', month:'long'});
    carregarDados();
};