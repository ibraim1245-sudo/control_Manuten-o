async function refresh() {
    const data = await eel.get_all_data()();
    
    // 1. Cálculos de MTBF e MTTR
    let totalMTBF = 0, totalMTTR = 0, countFalhas = 0;
    
    data.ativos.forEach(at => {
        const mtbf = at.falhas > 0 ? (at.tempo_operacao_total / at.falhas) / 60 : at.tempo_operacao_total / 60;
        const mttr = at.falhas > 0 ? (at.tempo_reparo_total / at.falhas) : 0;
        totalMTBF += mtbf;
        totalMTTR += mttr;
        countFalhas += at.falhas;
    });

    const avgMTBF = data.ativos.length > 0 ? (totalMTBF / data.ativos.length).toFixed(1) : 0;
    const avgMTTR = data.ativos.length > 0 ? (totalMTTR / data.ativos.length).toFixed(0) : 0;

    document.getElementById('kpi-mtbf').innerText = avgMTBF + "h";
    document.getElementById('kpi-mttr').innerText = avgMTTR + "m";

    // 2. Renderizar Ativos
    const tbody = document.getElementById('lista-ativos');
    tbody.innerHTML = data.ativos.map(at => `
        <tr>
            <td><strong>${at.nome}</strong></td>
            <td><span class="badge ${at.falhas > 3 ? 'danger' : 'success'}">${at.falhas > 3 ? 'Anomalia' : 'Operacional'}</span></td>
            <td><div class="health-bar"><div style="width:${100 - (at.falhas*10)}%"></div></div></td>
            <td>${at.loc}</td>
            <td>${((at.tempo_operacao_total / (at.falhas||1))/60).toFixed(1)}h</td>
        </tr>
    `).join('');

    // 3. Renderizar OS
    const osGrid = document.getElementById('lista-os');
    osGrid.innerHTML = data.ordens_servico.map(os => `
        <div class="os-card">
            <h4>${os.id} - ${os.ativo}</h4>
            <p>${os.desc}</p>
            <small>Abertura: ${os.abertura}</small>
            ${os.status === 'Aberta' ? 
                `<button onclick="fecharOS('${os.id}')">Concluir Reparo</button>` : 
                `<span class="done">Concluída</span>`}
        </div>
    `).join('');

    // Popular select de ativos no modal OS
    document.getElementById('os-ativo').innerHTML = data.ativos.map(at => `<option>${at.nome}</option>`).join('');
}

async function addAtivo() {
    const nome = document.getElementById('at-nome').value;
    const loc = document.getElementById('at-loc').value;
    const crit = document.getElementById('at-crit').value;
    await eel.gerenciar_ativo("add", {nome, loc, crit})();
    closeModal('modalAtivo');
    refresh();
}

async function addOS() {
    const ativo = document.getElementById('os-ativo').value;
    const desc = document.getElementById('os-desc').value;
    await eel.criar_os({ativo, desc})();
    closeModal('modalOS');
    refresh();
}

async function fecharOS(id) {
    const tempo = prompt("Quanto tempo durou o reparo (em minutos)?");
    if(tempo) {
        await eel.encerrar_os(id, tempo)();
        refresh();
    }
}

function tab(name) {
    document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
    document.getElementById('tab-' + name).style.display = 'block';
    refresh();
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

window.onload = refresh;