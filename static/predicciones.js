window.addEventListener('DOMContentLoaded', () => {
    cargarPartidosParaPredecir();
});

async function cargarPartidosParaPredecir() {
    try {
        const response = await fetch('/matches?estado=Por jugar&sort_order=asc');
        const partidos = await response.json();
        const form = document.getElementById('prediction-form');
        const container = document.getElementById('form-container');
        if (!form || !container) return;
        container.innerHTML = '';
        if (partidos.length === 0) {
            container.innerHTML = '<p>No hay partidos disponibles para predecir en este momento.</p>';
            return;
        }
        partidos.forEach(partido => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match-prediction';
            matchDiv.dataset.matchId = partido.ID_Partido;
            const plantillaLocal = (plantillasEquipos[partido.Equipo_Local] || []).map(p => p.nombre);
            const plantillaVisitante = (plantillasEquipos[partido.Equipo_Visitante] || []).map(p => p.nombre);
            const plantillaMadrid = (plantillasEquipos["Real Madrid"] || []).map(p => p.nombre);
            const goleadorOptions = plantillaMadrid.map(nombre => `<option value="${nombre}">${nombre}</option>`).join('');
            const mvpLocalOptions = plantillaLocal.map(nombre => `<option value="${nombre}">${nombre}</option>`).join('');
            const mvpVisitanteOptions = plantillaVisitante.map(nombre => `<option value="${nombre}">${nombre}</option>`).join('');
            matchDiv.innerHTML = `
                <p class="match-info">${partido.Competicion} - Jornada ${partido.Jornada_Numero}</p>
                <p class="match-info">${new Date(partido.Fecha_Hora_Partido).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <h4 class="match-header">
                    <img src="${escudos[partido.Equipo_Local] || ''}" alt="${partido.Equipo_Local}" class="team-crest">
                    <span>${partido.Equipo_Local} vs ${partido.Equipo_Visitante}</span>
                    <img src="${escudos[partido.Equipo_Visitante] || ''}" alt="${partido.Equipo_Visitante}" class="team-crest">
                </h4>
                <div class="form-row"><input type="number" placeholder="Goles L" name="goles_local" required min="0"><span>-</span><input type="number" placeholder="Goles V" name="goles_visitante" required min="0"></div>
                <div class="form-row"><select name="goleador" required><option value="" disabled selected>Primer Goleador (RM)</option>${goleadorOptions}</select></div>
                <p>MVP del Partido:</p>`;
            const mvpRow = document.createElement('div');
            mvpRow.className = 'form-row';
            const mvpLocalSelect = document.createElement('select');
            mvpLocalSelect.name = 'mvp_local';
            mvpLocalSelect.innerHTML = `<option value="" disabled selected>${partido.Equipo_Local}</option>${mvpLocalOptions}`;
            const mvpVisitanteSelect = document.createElement('select');
            mvpVisitanteSelect.name = 'mvp_visitante';
            mvpVisitanteSelect.innerHTML = `<option value="" disabled selected>${partido.Equipo_Visitante}</option>${mvpVisitanteOptions}`;
            mvpLocalSelect.addEventListener('change', () => { if (mvpLocalSelect.value) mvpVisitanteSelect.selectedIndex = 0; });
            mvpVisitanteSelect.addEventListener('change', () => { if (mvpVisitanteSelect.value) mvpLocalSelect.selectedIndex = 0; });
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
            container.appendChild(matchDiv);
        });
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Enviar Predicciones';
        container.appendChild(submitButton);
        form.addEventListener('submit', handleFormSubmit);
        const boosterCheckboxes = form.querySelectorAll('input[name="booster"]');
        boosterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                if (event.target.checked) {
                    boosterCheckboxes.forEach(otherCheckbox => { if (otherCheckbox !== event.target) otherCheckbox.checked = false; });
                }
            });
        });
    } catch (error) { console.error("Error al cargar los partidos:", error); }
}

async function handleFormSubmit(event) {
    event.preventDefault();
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
        const regularInputs = matchDiv.querySelectorAll('input[type="number"], select[name="goleador"]');
        regularInputs.forEach(input => {
            if (!input.value) { isFormValid = false; input.style.border = '2px solid red'; } 
            else { input.style.border = '1px solid var(--color-border)'; }
        });
        const mvpLocalSelect = matchDiv.querySelector('[name="mvp_local"]');
        const mvpVisitanteSelect = matchDiv.querySelector('[name="mvp_visitante"]');
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
    try {
        const response = await fetch('/predictions/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(predictions)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail);
        }
        showNotification('¡Todas tus predicciones han sido enviadas con éxito!', 'success');
        setTimeout(() => { window.location.href = "/"; }, 1500);
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    container.textContent = message;
    container.className = 'notification';
    container.classList.add(type);
    container.classList.add('show');
    setTimeout(() => {
        container.classList.remove('show');
    }, 4000);
}

