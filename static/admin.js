// Listener principal que se ejecuta cuando carga la página de admin
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const createMatchForm = document.getElementById('create-match-form');
    if (createMatchForm) createMatchForm.addEventListener('submit', handleCreateMatch);

    const createUserForm = document.getElementById('create-user-form');
    if (createUserForm) createUserForm.addEventListener('submit', handleCreateUser);

    const createMemeForm = document.getElementById('create-meme-form');
    if (createMemeForm) createMemeForm.addEventListener('submit', handleCreateMeme);

    const finalizeSeasonForm = document.getElementById('finalize-season-form');
    if (finalizeSeasonForm) finalizeSeasonForm.addEventListener('submit', handleFinalizeSeason);
    
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

    const editPredictionForm = document.getElementById('edit-prediction-form');
    if (editPredictionForm) editPredictionForm.addEventListener('submit', handleUpdatePrediction);
});

// =================================================================================
// SECCIÓN DE LOGIN
// =================================================================================
async function handleLogin(event) {
    event.preventDefault();
    const password = document.getElementById('admin-password').value;
    const formData = new FormData();
    formData.append('password', password);
    try {
        const response = await fetch('/admin/token', { method: 'POST', body: formData });
        if (response.ok) {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('admin-panel-section').style.display = 'flex';
            cargarUsuarios();
            cargarMemesAdmin();
            cargarPartidosPorJugar();
            populateFinalizeForm();
        } else {
            showNotification("Error: Contraseña incorrecta", 'error');
        }
    } catch (error) {
        showNotification("Ha ocurrido un error de conexión.", 'error');
    }
}


// =================================================================================
// SECCIÓN DE GESTIÓN DE USUARIOS
// =================================================================================
async function cargarUsuarios() {
    try {
        const response = await fetch('/users/');
        const usuarios = await response.json();
        const container = document.getElementById('users-list-container');
        container.innerHTML = '<ul>';
        usuarios.forEach(user => {
            container.innerHTML += `
                <li class="user-item">
                    <span>${user.Alias} (${user.Nombre_Usuario_Discord})</span>
                    <button class="delete-user-btn" data-user-id="${user.ID_Usuario}">Borrar</button>
                </li>`;
        });
        container.innerHTML += '</ul>';
        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.addEventListener('click', handleDeleteUser);
        });
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
    }
}

async function handleCreateUser(event) {
    event.preventDefault();
    const aliasInput = document.getElementById('alias');
    const discordIdInput = document.getElementById('discord-id');
    const userData = { Alias: aliasInput.value, Nombre_Usuario_Discord: discordIdInput.value };
    if (!userData.Alias || !userData.Nombre_Usuario_Discord) {
        showNotification("Debes rellenar tanto el Alias como el ID de Discord.", "error");
        return;
    }
    const response = await fetch('/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (response.ok) {
        showNotification('¡Usuario añadido con éxito!', 'success');
        aliasInput.value = ''; discordIdInput.value = '';
        cargarUsuarios();
    } else {
        showNotification('Error al añadir el usuario (quizás ya existe).', 'error');
    }
}

async function handleDeleteUser(event) {
    const userId = event.target.dataset.userId;
    if (!confirm(`¿Seguro que quieres borrar al usuario ${userId}?`)) return;
    const response = await fetch(`/users/${userId}`, { method: 'DELETE' });
    if (response.ok) {
        showNotification('Usuario borrado con éxito.', 'success');
        cargarUsuarios();
    } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.detail}`, 'error');
    }
}


// =================================================================================
// SECCIÓN DE GESTIÓN DE MEMES
// =================================================================================
async function cargarMemesAdmin() {
    const container = document.getElementById('memes-list-container');
    if (!container) return;
    try {
        const response = await fetch('/memes/');
        const memes = await response.json();
        container.innerHTML = '';
        memes.forEach(meme => {
            const memeDiv = document.createElement('div');
            memeDiv.className = 'meme-item';
            memeDiv.innerHTML = `
                <img src="${meme.URL_Imagen}" alt="${meme.Descripcion}" class="meme-preview">
                <span>${meme.Descripcion || 'Sin descripción'}</span>
                <button class="delete-meme-btn" data-meme-id="${meme.ID_Meme}">Borrar</button>
            `;
            container.appendChild(memeDiv);
        });
        document.querySelectorAll('.delete-meme-btn').forEach(button => {
            button.addEventListener('click', handleDeleteMeme);
        });
    } catch (error) {
        console.error("Error al cargar memes:", error);
    }
}

async function handleCreateMeme(event) {
    event.preventDefault();
    const memeData = {
        URL_Imagen: document.getElementById('meme-url').value,
        Descripcion: document.getElementById('meme-desc').value
    };
    if (!memeData.URL_Imagen) {
        showNotification("La URL no puede estar vacía", "error");
        return;
    }
    const response = await fetch('/memes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memeData)
    });
    if (response.ok) {
        showNotification('¡Meme añadido con éxito!', 'success');
        document.getElementById('create-meme-form').reset();
        cargarMemesAdmin();
    } else {
        showNotification('Error al añadir el meme.', 'error');
    }
}

async function handleDeleteMeme(event) {
    const button = event.target;
    const memeId = button.dataset.memeId;
    if (!confirm(`¿Seguro que quieres borrar el meme ${memeId}?`)) return;
    const response = await fetch(`/memes/${memeId}`, { method: 'DELETE' });
    if (response.ok) {
        showNotification(`Meme ${memeId} borrado.`, 'success');
        button.closest('.meme-item').remove();
    } else {
        showNotification('Error al borrar el meme.', 'error');
    }
}


// =================================================================================
// SECCIÓN DE GESTIÓN DE PARTIDOS
// =================================================================================
async function handleCreateMatch(event) {
    event.preventDefault();
    const matchData = {
        Competicion: document.getElementById('competicion').value,
        Fecha_Hora_Partido: document.getElementById('fecha').value,
        Equipo_Local: document.getElementById('equipo-local').value,
        Equipo_Visitante: document.getElementById('equipo-visitante').value,
        Jornada_Numero: parseInt(document.getElementById('jornada').value),
        Es_Partidazo: document.getElementById('es-partidazo').checked
    };
    const response = await fetch('/matches/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
    });
    if (response.ok) {
        showNotification('¡Partido creado con éxito!', 'success');
        document.getElementById('create-match-form').reset();
        cargarPartidosPorJugar();
    } else {
        showNotification('Error al crear el partido.', 'error');
    }
}

async function cargarPartidosPorJugar() {
    try {
        const response = await fetch('/matches/');
        const todosLosPartidos = await response.json();

        // Buscamos los dos contenedores en el HTML
        const pendingContainer = document.getElementById('upcoming-matches-container');
        const finishedContainer = document.getElementById('finished-matches-container');
        pendingContainer.innerHTML = '';
        finishedContainer.innerHTML = '';

        // Filtramos los partidos en dos listas separadas
        const partidosPendientes = todosLosPartidos.filter(p => p.Estado === 'Por jugar' || p.Estado === 'Cerrado');
        const partidosFinalizados = todosLosPartidos.filter(p => p.Estado === 'Finalizado');

        // --- Rellenamos la lista de PARTIDOS PENDIENTES ---
        if (partidosPendientes.length === 0) {
            pendingContainer.innerHTML = '<p>No hay partidos pendientes.</p>';
        } else {
            partidosPendientes.forEach(partido => {
                const plantillaLocal = (plantillasEquipos[partido.Equipo_Local] || []).map(p => p.nombre);
                const plantillaVisitante = (plantillasEquipos[partido.Equipo_Visitante] || []).map(p => p.nombre);
                const plantillaMadrid = (plantillasEquipos["Real Madrid"] || []).map(p => p.nombre);
                const goleadorOptions = plantillaMadrid.map(nombre => `<option value="${nombre}">${nombre}</option>`).join('');
                const mvpOptions = [...new Set([...plantillaLocal, ...plantillaVisitante])].map(nombre => `<option value="${nombre}">${nombre}</option>`).join('');
                const closeButtonHtml = partido.Estado === 'Por jugar' ? `<button class="close-pred-btn" data-match-id="${partido.ID_Partido}">Cerrar Preds</button>` : `<em>(Cerrado)</em>`;
                
                const matchDiv = document.createElement('div');
                matchDiv.className = 'upcoming-match-item';
                matchDiv.innerHTML = `
                    <div class="match-details">
                        <strong>${partido.Equipo_Local} vs ${partido.Equipo_Visitante}</strong>
                        <span>(Jornada ${partido.Jornada_Numero})</span>
                        ${closeButtonHtml}
                        <button class="delete-match-btn" data-match-id="${partido.ID_Partido}">Borrar</button>
                        <button class="toggle-predictions-btn" data-match-id="${partido.ID_Partido}">Ver/Editar</button>
                    </div>
                    <div class="predictions-list" id="predictions-for-${partido.ID_Partido}" style="display:none;"></div>
                    <div class="result-form" id="result-form-for-${partido.ID_Partido}">
                        <p><strong>Finalizar Partido:</strong></p>
                        <input type="number" placeholder="G. Local" name="goles_local" required>
                        <input type="number" placeholder="G. Visit." name="goles_visitante" required>
                        <select name="goleador_real" required><option value="" disabled selected>Goleador</option>${goleadorOptions}</select>
                        <select name="mvp_real" required><option value="" disabled selected>MVP</option>${mvpOptions}</select>
                        <button class="finalize-btn" data-match-id="${partido.ID_Partido}">Finalizar</button>
                    </div>`;
                pendingContainer.appendChild(matchDiv);
            });
        }

        // --- Rellenamos la lista de HISTORIAL DE PARTIDOS FINALIZADOS ---
        if (partidosFinalizados.length === 0) {
            finishedContainer.innerHTML = '<p>No hay partidos finalizados.</p>';
        } else {
            partidosFinalizados.forEach(partido => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'upcoming-match-item';
                matchDiv.innerHTML = `
                    <div class="match-details">
                        <strong>${partido.Equipo_Local} vs ${partido.Equipo_Visitante}</strong>
                        <span>(${partido.Goles_Local} - ${partido.Goles_Visitante})</span>
                        <button class="toggle-predictions-btn" data-match-id="${partido.ID_Partido}">Ver/Ajustar</button>
                    </div>
                    <div class="predictions-list" id="predictions-for-${partido.ID_Partido}" style="display:none;"></div>
                `;
                finishedContainer.appendChild(matchDiv);
            });
        }
        
        // Volvemos a asignar los eventos a todos los botones de ambas listas
        document.querySelectorAll('.toggle-predictions-btn').forEach(button => button.addEventListener('click', handleTogglePredictions));
        document.querySelectorAll('.delete-match-btn').forEach(button => button.addEventListener('click', handleDeleteMatch));
        document.querySelectorAll('.finalize-btn').forEach(button => button.addEventListener('click', handleFinalizeMatch));
        document.querySelectorAll('.close-pred-btn').forEach(button => button.addEventListener('click', handleClosePredictions));

    } catch (error) { 
        console.error("Error cargando partidos:", error); 
    }
}

async function handleDeleteMatch(event) {
    const button = event.target;
    const matchId = button.dataset.matchId;
    if (!confirm(`¿Estás seguro de que quieres borrar el partido ${matchId}?`)) return;
    const response = await fetch(`/matches/${matchId}`, { method: 'DELETE' });
    if (response.ok) {
        showNotification(`Partido ${matchId} borrado.`, 'success');
        button.closest('.upcoming-match-item').remove();
    } else {
        const errorData = await response.json();
        showNotification(`Error al borrar: ${errorData.detail}`, 'error');
    }
}

async function handleFinalizeMatch(event) {
    const button = event.target;
    const matchId = button.dataset.matchId;
    const formDiv = button.closest('.result-form');
    const resultData = {
        Goles_Local: parseInt(formDiv.querySelector('[name="goles_local"]').value),
        Goles_Visitante: parseInt(formDiv.querySelector('[name="goles_visitante"]').value),
        Goleador_Real: formDiv.querySelector('[name="goleador_real"]').value,
        MVP_Real: formDiv.querySelector('[name="mvp_real"]').value,
    };
    if (isNaN(resultData.Goles_Local) || isNaN(resultData.Goles_Visitante) || !resultData.Goleador_Real || !resultData.MVP_Real) {
        showNotification("Debes rellenar todos los campos del resultado.", 'error');
        return;
    }
    const response = await fetch(`/matches/${matchId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
    });
    if (response.ok) {
        showNotification(`Partido ${matchId} finalizado y puntos calculados.`, 'success');
        button.closest('.upcoming-match-item').remove();
    } else {
        showNotification(`Error al finalizar el partido ${matchId}.`, 'error');
    }
}

async function handleClosePredictions(event) {
    const button = event.target;
    const matchId = button.dataset.matchId;
    if (!confirm(`¿Seguro que quieres cerrar las predicciones para el partido ${matchId}?`)) return;
    const response = await fetch(`/matches/${matchId}/close`, { method: 'POST' });
    if (response.ok) {
        showNotification(`Predicciones para el partido ${matchId} cerradas.`, 'success');
        cargarPartidosPorJugar();
    } else {
        const errorData = await response.json();
        showNotification(`Error al cerrar: ${errorData.detail}`, 'error');
    }
}

// =================================================================================
// SECCIÓN DE GESTIÓN DE PREDICCIONES (DENTRO DE PARTIDOS)
// =================================================================================
async function handleTogglePredictions(event) {
    const button = event.target;
    const matchId = button.dataset.matchId;
    const container = document.getElementById(`predictions-for-${matchId}`);
    if (container.style.display === 'block') {
        container.style.display = 'none'; container.innerHTML = ''; return;
    }
    const response = await fetch(`/matches/${matchId}/predictions`);
    const predicciones = await response.json();
    container.innerHTML = '';
    if (predicciones.length === 0) {
        container.innerHTML = '<p><em>No hay predicciones para este partido.</em></p>';
    } else {
        predicciones.forEach(pred => {
            const predDiv = document.createElement('div');
            predDiv.className = 'prediction-item';
            predDiv.id = `prediction-row-${pred.ID_Prediccion}`;
            predDiv.innerHTML = `
                <span><strong>${pred.Alias}</strong>: ${pred.Prediccion_Goles_Local}-${pred.Prediccion_Goles_Visitante} | Puntos: <strong>${pred.Puntos_Obtenidos}</strong></span>
                <div class="prediction-actions">
                    <button class="adjust-points-btn" data-prediction-id="${pred.ID_Prediccion}" data-current-points="${pred.Puntos_Obtenidos}">Ajustar Pts</button>
                    <button class="edit-prediction-btn" data-prediction-id="${pred.ID_Prediccion}">Editar</button>
                    <button class="delete-prediction-btn" data-prediction-id="${pred.ID_Prediccion}">Borrar</button>
                </div>`;
            container.appendChild(predDiv);
        });
    }
    container.style.display = 'block';
    document.querySelectorAll('.edit-prediction-btn').forEach(button => button.addEventListener('click', handleEditPrediction));
    document.querySelectorAll('.delete-prediction-btn').forEach(button => button.addEventListener('click', handleDeletePrediction));
    document.querySelectorAll('.adjust-points-btn').forEach(button => button.addEventListener('click', handleAdjustPoints));
}

async function handleDeletePrediction(event) {
    const button = event.target;
    const predictionId = button.dataset.predictionId;
    if (!confirm(`¿Estás seguro de que quieres borrar la predicción ${predictionId}?`)) return;
    const response = await fetch(`/predictions/${predictionId}`, { method: 'DELETE' });
    if (response.ok) {
        showNotification(`Predicción ${predictionId} borrada con éxito.`, 'success');
        button.closest('.prediction-item').remove();
    } else {
        showNotification('Error al borrar la predicción.', 'error');
    }
}

async function handleEditPrediction(event) {
    const predictionId = event.target.dataset.predictionId;
    const response = await fetch(`/predictions/${predictionId}`);
    if (!response.ok) { showNotification("No se pudieron cargar los datos de la predicción.", "error"); return; }
    const pred = await response.json();
    const matchResponse = await fetch(`/matches/${pred.ID_Partido}`);
    const partido = await matchResponse.json();
    if (!partido) return;
    document.getElementById('edit-prediction-id').value = pred.ID_Prediccion;
    document.getElementById('edit-goles-local').value = pred.Prediccion_Goles_Local;
    document.getElementById('edit-goles-visitante').value = pred.Prediccion_Goles_Visitante;
    const goleadorSelect = document.getElementById('edit-goleador');
    const mvpSelect = document.getElementById('edit-mvp');
    const plantillaLocal = (plantillasEquipos[partido.Equipo_Local] || []).map(p => p.nombre);
    const plantillaVisitante = (plantillasEquipos[partido.Equipo_Visitante] || []).map(p => p.nombre);
    const plantillaMadrid = (plantillasEquipos["Real Madrid"] || []).map(p => p.nombre);
    goleadorSelect.innerHTML = `<option value="" disabled>Goleador (RM)</option>` + plantillaMadrid.map(n => `<option value="${n}" ${n === pred.Prediccion_Goleador ? 'selected' : ''}>${n}</option>`).join('');
    mvpSelect.innerHTML = `<option value="" disabled>MVP</option>` + [...new Set([...plantillaLocal, ...plantillaVisitante])].map(n => `<option value="${n}" ${n === pred.Prediccion_MVP ? 'selected' : ''}>${n}</option>`).join('');
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

async function handleUpdatePrediction(event) {
    event.preventDefault();
    const predictionId = document.getElementById('edit-prediction-id').value;
    const updateData = {
        Prediccion_Goles_Local: parseInt(document.getElementById('edit-goles-local').value),
        Prediccion_Goles_Visitante: parseInt(document.getElementById('edit-goles-visitante').value),
        Prediccion_Goleador: document.getElementById('edit-goleador').value,
        Prediccion_MVP: document.getElementById('edit-mvp').value
    };
    const response = await fetch(`/predictions/${predictionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    });
    if (response.ok) {
        const data = await response.json();
        showNotification('¡Predicción actualizada!', 'success');
        const row = document.getElementById(`prediction-row-${data.ID_Prediccion}`);
        if(row) {
            row.querySelector('span').innerHTML = `<strong>${data.Alias}</strong>: ${data.Prediccion_Goles_Local}-${data.Prediccion_Goles_Visitante} | G: ${data.Prediccion_Goleador} | MVP: ${data.Prediccion_MVP}`;
        }
        closeEditModal();
    } else {
        showNotification('Error al actualizar.', 'error');
    }
}

// =================================================================================
// SECCIÓN DE FINALIZACIÓN DE TEMPORADA
// =================================================================================
function populateSelect(elements, options, placeholder) {
    const selectList = (elements instanceof NodeList || Array.isArray(elements)) ? elements : [elements];
    selectList.forEach(select => {
        if (!select) return;
        select.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        options.forEach(optionItem => {
            const option = document.createElement('option');
            if (typeof optionItem === 'object' && optionItem !== null) {
                option.value = optionItem.nombre;
                option.textContent = optionItem.nombre;
            } else {
                option.value = optionItem;
                option.textContent = optionItem;
            }
            select.appendChild(option);
        });
    });
}

// Función que organiza el llenado del formulario de finalización
function populateFinalizeForm() {
    const form = document.getElementById('finalize-season-form');
    if (!form) return;
    populateSelect(form.querySelectorAll('#res-campeon, .res-ucl, .res-el, #res-conference, .res-descenso'), equiposLaLiga, 'Selecciona un equipo');
    const teamSelectors = form.querySelectorAll('.team-selector');
    teamSelectors.forEach(teamSelector => {
        populateSelect(teamSelector, equiposLaLiga, "Selecciona un equipo");
        teamSelector.addEventListener('change', () => {
            const selectedTeam = teamSelector.value;
            const playerSelector = document.getElementById(teamSelector.dataset.playerTarget);
            const filterType = teamSelector.dataset.filter;
            let playersToShow = plantillasEquipos[selectedTeam] || [];
            if (filterType === 'spanish') {
                playersToShow = playersToShow.filter(player => player.nacionalidad === 'España');
            } else if (filterType === 'goalkeeper') {
                playersToShow = playersToShow.filter(player => player.posicion === 'POR');
            }
            populateSelect(playerSelector, playersToShow, "Selecciona un jugador");
        });
    });
}

async function handleFinalizeSeason(event) {
    event.preventDefault();
    if (!confirm("¿ESTÁS SEGURO? Esta acción calculará y sumará todos los puntos de temporada.")) return;
    const resultData = {
        Competicion: "LaLiga",
        Campeon: document.getElementById('res-campeon').value,
        Clasificados_UCL: Array.from(document.querySelectorAll('.res-ucl')).map(s => s.value),
        Clasificados_EL: Array.from(document.querySelectorAll('.res-el')).map(s => s.value),
        Clasificado_Conference: document.getElementById('res-conference').value,
        Descensos: Array.from(document.querySelectorAll('.res-descenso')).map(s => s.value),
        Pichichi: document.getElementById('res-pichichi').value,
        Max_Asistente: document.getElementById('res-max-asistente').value,
        Zamora: document.getElementById('res-zamora').value,
        Zarra: document.getElementById('res-zarra').value,
        MVP: document.getElementById('res-mvp').value
    };
    try {
        const response = await fetch('/season-predictions/finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail);
        }
        const successData = await response.json();
        showNotification(successData.detail, 'success');
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// =================================================================================
// FUNCIÓN DE NOTIFICACIONES REUTILIZABLE
// =================================================================================
function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    container.textContent = message;
    container.className = 'notification';
    container.classList.add(type);
    container.classList.add('show');
    setTimeout(() => {
        container.classList.remove('show');
    }, 3000);
}

async function handleAdjustPoints(event) {
    const button = event.target;
    const predictionId = button.dataset.predictionId;
    const currentPoints = button.dataset.currentPoints;

    const newPointsStr = prompt(`Introduce la NUEVA puntuación TOTAL para esta predicción (la actual es ${currentPoints}):`);
    if (newPointsStr === null) return; // El usuario canceló

    const newPoints = parseInt(newPointsStr);
    if (isNaN(newPoints) || newPoints < 0) {
        showNotification("Debes introducir un número válido y positivo.", "error");
        return;
    }

    const response = await fetch(`/predictions/${predictionId}/adjust-points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puntos_obtenidos: newPoints })
    });

    if (response.ok) {
        showNotification('Puntos actualizados correctamente.', 'success');
        // Forzamos la recarga de las listas para ver el cambio reflejado en todas partes
        cargarListasDePartidos();
        cargarUsuarios();
    } else {
        showNotification('Error al actualizar los puntos.', 'error');
    }
}