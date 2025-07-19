function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return; // Añadimos esta seguridad
    container.textContent = message;
    container.className = 'notification'; // Clase base
    container.classList.add(type); // success o error
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

        const partidosPorJugar = partidos.filter(p => p.Estado && p.Estado.trim().toLowerCase() === 'por jugar');
        if (partidosPorJugar.length === 0) {
            container.innerHTML = '<p>No hay partidos disponibles para predecir en este momento.</p>';
            return;
        }

        const form = document.createElement('form');
        form.id = 'prediction-form';
        
        // El campo de usuario se queda como estaba
        partidosPorJugar.forEach(partido => {
            const matchDiv = document.createElement('div');
            // ... (el código que crea el HTML de cada partido se queda igual)
            matchDiv.className = 'match-prediction';
            matchDiv.dataset.matchId = partido.ID_Partido;

            const infoYCamposSimplesHTML = `
                <p class="match-info">${partido.Competicion} - Jornada ${partido.Jornada_Numero}</p>
                <p class="match-info">${new Date(partido.Fecha_Hora_Partido).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <h4 class="match-header">
                    <img src="${escudos[partido.Equipo_Local] || ''}" alt="${partido.Equipo_Local}" class="team-crest">
                    <span>${partido.Equipo_Local} vs ${partido.Equipo_Visitante}</span>
                    <img src="${escudos[partido.Equipo_Visitante] || ''}" alt="${partido.Equipo_Visitante}" class="team-crest">
                </h4>
                <div class="form-row">
                    <input type="number" placeholder="Goles L" name="goles_local" required min="0">
                    <span>-</span>
                    <input type="number" placeholder="Goles V" name="goles_visitante" required min="0">
                </div>
                <div class="form-row">
                    <select name="goleador" required>
                        <option value="" disabled selected>Primer Goleador (RM)</option>
                        ${plantillasEquipos["Real Madrid"].map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                </div>
                <p>MVP del Partido:</p>`;
            matchDiv.innerHTML = infoYCamposSimplesHTML;

            const mvpRow = document.createElement('div');
            mvpRow.className = 'form-row';
            const plantillaLocal = plantillasEquipos[partido.Equipo_Local] || [];
            const plantillaVisitante = plantillasEquipos[partido.Equipo_Visitante] || [];
            const mvpLocalSelect = document.createElement('select');
            mvpLocalSelect.name = 'mvp_local';
            mvpLocalSelect.innerHTML = `<option value="" disabled selected>${partido.Equipo_Local}</option>${plantillaLocal.map(p => `<option value="${p}">${p}</option>`).join('')}`;
            const mvpVisitanteSelect = document.createElement('select');
            mvpVisitanteSelect.name = 'mvp_visitante';
            mvpVisitanteSelect.innerHTML = `<option value="" disabled selected>${partido.Equipo_Visitante}</option>${plantillaVisitante.map(p => `<option value="${p}">${p}</option>`).join('')}`;
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
            form.appendChild(matchDiv);
        });

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Enviar Predicciones';
        form.appendChild(submitButton);
        container.appendChild(form);
        form.addEventListener('submit', handleFormSubmit);

        // --- LÓGICA NUEVA PARA EL BOOSTER ÚNICO ---
        const boosterCheckboxes = form.querySelectorAll('input[name="booster"]');
        boosterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                // Si este checkbox se ha marcado...
                if (event.target.checked) {
                    // ...recorremos todos los demás y los desmarcamos.
                    boosterCheckboxes.forEach(otherCheckbox => {
                        if (otherCheckbox !== event.target) {
                            otherCheckbox.checked = false;
                        }
                    });
                }
            });
        });
        // --- FIN DE LA LÓGICA NUEVA ---

    } catch (error) {
        console.error("Error al cargar los partidos:", error);
    }
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
            if (!input.value) {
                isFormValid = false;
                input.style.border = '2px solid red';
            } else {
                input.style.border = '1px solid var(--color-border)';
            }
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
        // Usamos un bucle for...of para poder detenerlo si hay un error
        for (const pred of predictions) {
            const response = await fetch('/predictions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pred)
            });

            // --- LÓGICA NUEVA: Comprobamos la respuesta del servidor ---
            if (!response.ok) {
                const errorData = await response.json();
                // Mostramos el mensaje de error específico que nos da el backend
                showNotification(`Error: ${errorData.detail}`, 'error');
                return; // Detenemos el proceso si una predicción falla
            }
        }

        // Si el bucle termina sin errores, mostramos el mensaje de éxito
        showNotification('¡Predicciones enviadas con éxito!', 'success');
        setTimeout(() => { window.location.href = "/"; }, 1500);

    } catch (error) {
        showNotification('Hubo un error de conexión al enviar.', 'error');
    }
}

