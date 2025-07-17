function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    container.textContent = message;
    container.className = type; // success o error
    container.classList.add('show');

    setTimeout(() => {
        container.classList.remove('show');
    }, 3000); // La notificación desaparecerá después de 3 segundos
}

// Listener que se ejecuta solo en la página de predicciones
window.addEventListener('DOMContentLoaded', () => {
    cargarPartidosParaPredecir();
});

async function cargarPartidosParaPredecir() {
    try {
        const response = await fetch('/matches/');
        const partidos = await response.json();
        const container = document.getElementById('form-container');
        container.innerHTML = '';

        const partidosPorJugar = partidos.filter(p => p.Estado === 'Por jugar');
        if (partidosPorJugar.length === 0) {
            container.innerHTML = '<p>No hay partidos disponibles para predecir en este momento.</p>';
            return;
        }

        const form = document.createElement('form');
        form.id = 'prediction-form';
        
        partidosPorJugar.forEach(partido => {
            const equipoLocal = partido.Equipo_Local;
            const equipoVisitante = partido.Equipo_Visitante;

            const plantillaLocal = plantillasEquipos[equipoLocal] || [];
            const plantillaVisitante = plantillasEquipos[equipoVisitante] || [];
            const plantillaMadrid = plantillasEquipos["Real Madrid"] || [];

            const goleadorOptions = plantillaMadrid.map(p => `<option value="${p}">${p}</option>`).join('');
            const mvpLocalOptions = plantillaLocal.map(p => `<option value="${p}">${p}</option>`).join('');
            const mvpVisitanteOptions = plantillaVisitante.map(p => `<option value="${p}">${p}</option>`).join('');

            const matchDiv = document.createElement('div');
            matchDiv.className = 'match-prediction';
            matchDiv.dataset.matchId = partido.ID_Partido;

            const infoYCamposSimplesHTML = `
                <p class="match-info">${partido.Competicion} - Jornada ${partido.Jornada_Numero}</p>
                <p class="match-info">${new Date(partido.Fecha_Hora_Partido).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <h4 class="match-header">
                    <img src="${escudos[equipoLocal] || ''}" alt="${equipoLocal}" class="team-crest">
                    <span>${equipoLocal} vs ${equipoVisitante}</span>
                    <img src="${escudos[equipoVisitante] || ''}" alt="${equipoVisitante}" class="team-crest">
                </h4>
                <div class="form-row">
                    <input type="number" placeholder="Goles L" name="goles_local" required min="0">
                    <span>-</span>
                    <input type="number" placeholder="Goles V" name="goles_visitante" required min="0">
                </div>
                <div class="form-row">
                    <select name="goleador" required>
                        <option value="" disabled selected>Primer Goleador (RM)</option>
                        ${goleadorOptions}
                    </select>
                </div>
                <p>MVP del Partido:</p>`;
            matchDiv.innerHTML = infoYCamposSimplesHTML;

            const mvpRow = document.createElement('div');
            mvpRow.className = 'form-row';

            const mvpLocalSelect = document.createElement('select');
            mvpLocalSelect.name = 'mvp_local';
            mvpLocalSelect.innerHTML = `<option value="" disabled selected>${equipoLocal}</option>${mvpLocalOptions}`;

            const mvpVisitanteSelect = document.createElement('select');
            mvpVisitanteSelect.name = 'mvp_visitante';
            mvpVisitanteSelect.innerHTML = `<option value="" disabled selected>${equipoVisitante}</option>${mvpVisitanteOptions}`;

            mvpLocalSelect.addEventListener('change', () => {
                if (mvpLocalSelect.value) mvpVisitanteSelect.selectedIndex = 0;
            });
            mvpVisitanteSelect.addEventListener('change', () => {
                if (mvpVisitanteSelect.value) mvpLocalSelect.selectedIndex = 0;
            });

            mvpRow.appendChild(mvpLocalSelect);
            mvpRow.appendChild(mvpVisitanteSelect);
            matchDiv.appendChild(mvpRow);

            if (partido.Es_Partidazo) {
                const partidazoLabel = document.createElement('p');
                partidazoLabel.className = 'partidazo-label';
                partidazoLabel.innerHTML = 'Partidazo DORM (x2) 🔥';
                matchDiv.appendChild(partidazoLabel);
            } else {
                const boosterDiv = document.createElement('div');
                boosterDiv.className = 'form-row booster';
                boosterDiv.innerHTML = `<input type="checkbox" name="booster" id="booster-${partido.ID_Partido}"><label for="booster-${partido.ID_Partido}">Activar Booster x2</label>`;
                matchDiv.appendChild(boosterDiv);
            }
            form.appendChild(matchDiv);
        });

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Enviar Predicciones';
        form.appendChild(submitButton);
        container.appendChild(form);
        form.addEventListener('submit', handleFormSubmit);
    } catch (error) {
        console.error("Error al cargar los partidos:", error);
    }
}

// Función para manejar el envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();

    // --- VALIDACIÓN MEJORADA ---
    const discordUserInput = document.getElementById('discord-username');
    const discordUser = discordUserInput.value;
    if (!discordUser.trim()) {
        showNotification("Por favor, introduce tu nombre de usuario de Discord.", 'error');
        discordUserInput.focus();
        return;
    }

    const formMatches = document.querySelectorAll('.match-prediction');
    let isFormValid = true;

    formMatches.forEach(matchDiv => {
        // Revisa todos los inputs de texto y número
        const regularInputs = matchDiv.querySelectorAll('input[type="number"], select[name="goleador"]');
        regularInputs.forEach(input => {
            if (!input.value) {
                isFormValid = false;
                input.style.border = '2px solid red';
            } else {
                input.style.border = '1px solid var(--color-border)';
            }
        });

        // Revisa el caso especial del MVP
        const mvpLocalSelect = matchDiv.querySelector('[name="mvp_local"]');
        const mvpVisitanteSelect = matchDiv.querySelector('[name="mvp_visitante"]');

        // Si ninguno de los dos desplegables de MVP tiene un valor, es un error
        if (!mvpLocalSelect.value && !mvpVisitanteSelect.value) {
            isFormValid = false;
            mvpLocalSelect.style.border = '2px solid red';
            mvpVisitanteSelect.style.border = '2px solid red';
        } else {
            mvpLocalSelect.style.border = '1px solid var(--color-border)';
            mvpVisitanteSelect.style.border = '1px solid var(--color-border)';
        }
    });

    if (!isFormValid) {
        showNotification("Por favor, rellena todos los campos requeridos.", 'error');
        return;
    }
    // --- FIN VALIDACIÓN ---


    // El resto del código para enviar los datos se queda igual...
    const predictions = [];
    formMatches.forEach(matchDiv => {
        const mvpLocal = matchDiv.querySelector('[name="mvp_local"]').value;
        const mvpVisitante = matchDiv.querySelector('[name="mvp_visitante"]').value;
        const boosterInput = matchDiv.querySelector('[name="booster"]');

        const prediction = {
            ID_Partido: parseInt(matchDiv.dataset.matchId),
            Nombre_Usuario_Discord: discordUser,
            Prediccion_Goles_Local: parseInt(matchDiv.querySelector('[name="goles_local"]').value),
            Prediccion_Goles_Visitante: parseInt(matchDiv.querySelector('[name="goles_visitante"]').value),
            Prediccion_Goleador: matchDiv.querySelector('[name="goleador"]').value,
            Prediccion_MVP: mvpLocal || mvpVisitante,
            Booster_Activado: boosterInput ? boosterInput.checked : false,
        };
        predictions.push(prediction);
    });

    for (const pred of predictions) {
        await fetch('/predictions/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pred)
        });
    }

    showNotification('¡Predicciones enviadas con éxito!', 'success');
    setTimeout(() => { window.location.href = "/"; }, 1500);
}