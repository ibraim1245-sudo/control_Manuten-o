let chartPrio;

async function updateDash() {
    const stats = await eel.get_stats()();
    document.getElementById('k-ativos').innerText = stats.total_ativos;
    document.getElementById('k-os').innerText = stats.os_abertas;
    document.getElementById('k-custo').innerText = "R$ " + stats.custo_total.toFixed(2);

    renderCharts(stats.grafico_prio);
}

function renderCharts(dataPrio) {
    const ctx = document.getElementById('chartPrio').getContext('2d');
    if(chartPrio) chartPrio.destroy();
    chartPrio = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Crítica', 'Alta', 'Média'],
            datasets: [{
                data: dataPrio,
                backgroundColor: ['#ef4444', '#f97316', '#3b82f6'],
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }
    });
}

window.onload = updateDash;