// --- LÓGICA DE TEMA Y FACTOUS ---
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            let theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', theme);
        });
    }
    if(document.getElementById('factous-popup')) {
        setInterval(showRandomFactou, 25000);
    }
});
function showRandomFactou() {
    const popup = document.getElementById('factous-popup');
    if (!popup || typeof factousData === 'undefined' || factousData.length === 0) return;
    const advice = factousData[Math.floor(Math.random() * factousData.length)];
    document.getElementById('factous-text').textContent = advice.text;
    document.getElementById('factous-image').src = advice.image;
    popup.classList.add('show');
    setTimeout(() => { popup.classList.remove('show'); }, 8000);
}
// ---------------------------------------------------

// --- LÓGICA DE LA PÁGINA DE RESULTADOS ---
window.addEventListener('DOMContentLoaded', () => {
    cargarListasDePartidos();
});

async function cargarListasDePartidos() {
    try {
        const responsePorJugar = await fetch('/matches?estado=Cerrado&sort_order=asc');
        const partidosPorJugar = await responsePorJugar.json();

        const responseFinalizados = await fetch('/matches?estado=Finalizado&sort_order=desc');
        const partidosFinalizados = await responseFinalizados.json();
        
        renderListaPartidos(partidosPorJugar, 'upcoming-matches-list');
        renderListaPartidos(partidosFinalizados, 'finished-matches-list');
    } catch (error) {
        console.error("Error al cargar las listas de partidos:", error);
    }
}

function renderListaPartidos(partidos, containerId) {
    const listContainer = document.getElementById(containerId);
    if (!listContainer) return;
    const title = listContainer.querySelector('h2').outerHTML;
    listContainer.innerHTML = title;

    if (!partidos || partidos.length === 0) {
        const message = containerId.includes('upcoming') ? '<p>No hay próximos partidos (leaks).</p>' : '<p>No hay partidos finalizados.</p>';
        listContainer.innerHTML += message;
        return;
    }
    partidos.forEach(partido => {
        const matchEntry = document.createElement('div');
        matchEntry.className = 'match-list-item';
        matchEntry.innerHTML = `
            <strong>${partido.Equipo_Local} vs ${partido.Equipo_Visitante} ${partido.Es_Partidazo ? '🔥' : ''}</strong><br>
            <small>${partido.Competicion} - ${new Date(partido.Fecha_Hora_Partido).toLocaleDateString('es-ES')}</small>
        `;
        matchEntry.dataset.matchId = partido.ID_Partido;
        matchEntry.dataset.matchStatus = partido.Estado; 
        listContainer.appendChild(matchEntry);
    });
    listContainer.addEventListener('click', (event) => {
        const matchItem = event.target.closest('.match-list-item');
        if (matchItem) {
            const matchId = matchItem.dataset.matchId;
            const matchStatus = matchItem.dataset.matchStatus;
            cargarDetallesDePartido(matchId, matchStatus);
        }
    });
}

async function cargarDetallesDePartido(matchId, matchStatus) {
    const detailsContainer = document.getElementById('details-container');
    detailsContainer.innerHTML = '<p>Cargando predicciones...</p>';
    try {
        const response = await fetch(`/matches/${matchId}/predictions`);
        const predicciones = await response.json();
        if (matchStatus === 'Finalizado') {
            predicciones.sort((a, b) => b.Puntos_Obtenidos - a.Puntos_Obtenidos);
        }
        const puntosHeader = matchStatus === 'Finalizado' ? '<th>Puntos Ganados</th>' : '';
        const boosterHeader = matchStatus !== 'Finalizado' ? '<th>Booster</th>' : '<th>Booster</th>'; // Always show booster
        let tableHtml = `
            <table id="results-table">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Resultado</th>
                        <th>Goleador</th>
                        <th>MVP</th>
                        ${boosterHeader}
                        ${puntosHeader}
                    </tr>
                </thead>
                <tbody>
                    ${predicciones.map(pred => {
                        const puntosCell = matchStatus === 'Finalizado' ? `<td><strong>${pred.Puntos_Obtenidos}</strong></td>` : '';
                        const boosterCell = `<td>${pred.Booster_Activado ? '<strong>x2</strong>' : 'No'}</td>`;
                        return `
                            <tr>
                                <td>${pred.Alias}</td>
                                <td>${pred.Prediccion_Goles_Local} - ${pred.Prediccion_Goles_Visitante}</td>
                                <td>${pred.Prediccion_Goleador}</td>
                                <td>${pred.Prediccion_MVP}</td>
                                ${boosterCell}
                                ${puntosCell}
                            </tr>`
                    }).join('')}
                </tbody>
            </table>`;
        detailsContainer.innerHTML = tableHtml;
    } catch (error) {
        detailsContainer.innerHTML = '<p>Error al cargar los detalles.</p>';
        console.error("Error cargando detalles de partido:", error);
    }
}