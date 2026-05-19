let currentToolId = null;

function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById('tab-' + tab).style.display = 'block';
    if(tab === 'dash' || tab === 'lista') carregarDados();
}

async function cadastrarFerramenta() {
    const nome = document.getElementById('tool-name').value;
    const status = document.getElementById('tool-status').value;
    const priority = document.getElementById('tool-priority').value;
    
    if(nome) {
        await eel.salvar_ferramenta(nome, status, priority)();
        alert("Ferramenta cadastrada!");
        showTab('lista');
    }
}

async function carregarDados() {
    const ferramentas = await eel.listar_ferramentas()();
    
    // Atualiza Stats
    document.getElementById('stat-total').innerText = ferramentas.length;
    document.getElementById('stat-op').innerText = ferramentas.filter(f => f.status === 'Operacional').length;
    document.getElementById('stat-man').innerText = ferramentas.filter(f => f.status !== 'Operacional').length;

    // Atualiza Tabela
    const tbody = document.getElementById('tool-list-body');
    tbody.innerHTML = "";
    ferramentas.forEach(f => {
        tbody.innerHTML += `
            <tr>
                <td>${f.id.slice(-6)}</td>
                <td><strong>${f.nome}</strong></td>
                <td><span class="badge">${f.status}</span></td>
                <td>${f.prioridade}</td>
                <td>
                    <button onclick="openHistory('${f.id}')">👁️ Ver/Editar</button>
                    <button style="background:red" onclick="excluir('${f.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });
}

async function openHistory(id) {
    const ferramentas = await eel.listar_ferramentas()();
    const tool = ferramentas.find(f => f.id === id);
    currentToolId = id;

    document.getElementById('modal-title').innerText = "Histórico: " + tool.nome;
    const content = document.getElementById('history-content');
    content.innerHTML = tool.historico.map(h => `
        <p style="font-size:13px; border-left:2px solid #ccc; padding-left:10px;">
            <strong>${h.data}</strong> - ${h.status}<br>
            <small>${h.evento}</small>
        </p>
    `).join('');

    document.getElementById('modal-history').style.display = "block";
}

async function salvarAtualizacao() {
    const status = document.getElementById('new-status').value;
    const obs = document.getElementById('update-obs').value || "Atualização de rotina";
    
    await eel.atualizar_status(currentToolId, status, obs)();
    closeModal();
    carregarDados();
}

function closeModal() { document.getElementById('modal-history').style.display = "none"; }
async function excluir(id) { if(confirm("Excluir definitivamente?")) { await eel.excluir_ferramenta(id)(); carregarDados(); } }

window.onload = () => carregarDados();