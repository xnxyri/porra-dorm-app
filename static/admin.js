// Listener principal que se ejecuta cuando carga la página de admin
document.addEventListener('DOMContentLoaded', () => {
    // Asignación de eventos a los formularios
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const createMatchForm = document.getElementById('create-match-form');
    if (createMatchForm) createMatchForm.addEventListener('submit', handleCreateMatch);

    const createUserForm = document.getElementById('create-user-form');
    if (createUserForm) createUserForm.addEventListener('submit', handleCreateUser);

    const createMemeForm = document.getElementById('create-meme-form');
    if (createMemeForm) createMemeForm.addEventListener('submit', handleCreateMeme);

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
            // Al iniciar sesión, cargamos todo el contenido del panel
            cargarUsuarios();
            cargarMemesAdmin();
            cargarPartidosPorJugar();
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

    // Asignamos el evento a los nuevos botones de borrar
    document.querySelectorAll('.delete-user-btn').forEach(button => {
        button.addEventListener('click', handleDeleteUser);
    });
}

async function handleCreateUser(event) {
    event.preventDefault();
    const aliasInput = document.getElementById('alias');
    const discordIdInput = document.getElementById('discord-id');
    const userData = {
        Alias: aliasInput.value,
        Nombre_Usuario_Discord: discordIdInput.value
    };
    if (!userData.Nombre_Usuario_Discord) {
        showNotification("El ID de Discord no puede estar vacío", "error");
        return;
    }

    const response = await fetch('/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    if (response.ok) {
        showNotification('¡Usuario añadido con éxito!', 'success');
        discordIdInput.value = ''; // Limpia el campo
        cargarUsuarios(); // Recargamos la lista
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
        cargarUsuarios(); // Recargamos la lista
    } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.detail}`, 'error');
    }
}

// =================================================================================
// SECCIÓN DE GESTIÓN DE MEMES
// =================================================================================
async function cargarMemesAdmin() {
    const response = await fetch('/memes/');
    const memes = await response.json();
    const container = document.getElementById('memes-list-container');
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
        const partidos = await response.json();
        const container = document.getElementById('upcoming-matches-container');
        container.innerHTML = '';

        const partidosPorJugar = partidos.filter(p => p.Estado === 'Por jugar');
        if (partidosPorJugar.length === 0) {
            container.innerHTML = '<p>No hay partidos pendientes de finalizar.</p>';
            return;
        }

        partidosPorJugar.forEach(partido => {
            const plantillaLocal = plantillasEquipos[partido.Equipo_Local] || [];
            const plantillaVisitante = plantillasEquipos[partido.Equipo_Visitante] || [];
            const plantillaMadrid = plantillasEquipos["Real Madrid"] || [];

            const goleadorOptions = plantillaMadrid.map(p => `<option value="${p}">${p}</option>`).join('');
            const mvpOptions = [...new Set([...plantillaLocal, ...plantillaVisitante])].map(p => `<option value="${p}">${p}</option>`).join('');

            const matchDiv = document.createElement('div');
            matchDiv.className = 'upcoming-match-item';
            matchDiv.innerHTML = `
                <div class="match-details">
                    <strong>${partido.Equipo_Local} vs ${partido.Equipo_Visitante}</strong>
                    <button class="toggle-predictions-btn" data-match-id="${partido.ID_Partido}">Ver/Editar Predicciones</button>
                    <button class="delete-match-btn" data-match-id="${partido.ID_Partido}">Borrar Partido</button>
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
            container.appendChild(matchDiv);
        });

        document.querySelectorAll('.toggle-predictions-btn').forEach(button => button.addEventListener('click', handleTogglePredictions));
        document.querySelectorAll('.delete-match-btn').forEach(button => button.addEventListener('click', handleDeleteMatch));
        document.querySelectorAll('.finalize-btn').forEach(button => button.addEventListener('click', handleFinalizeMatch));
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


// =================================================================================
// SECCIÓN DE GESTIÓN DE PREDICCIONES (DENTRO DE PARTIDOS)
// =================================================================================
async function handleTogglePredictions(event) {
    const button = event.target;
    const matchId = button.dataset.matchId;
    const container = document.getElementById(`predictions-for-${matchId}`);

    if (container.style.display === 'block') {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
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
            const alias = aliasUsuarios[pred.Nombre_Usuario_Discord] || pred.Nombre_Usuario_Discord;

            // --- CÓDIGO CORREGIDO CON AMBOS BOTONES ---
            predDiv.innerHTML = `
                <span><strong>${alias}</strong>: ${pred.Prediccion_Goles_Local}-${pred.Prediccion_Goles_Visitante} | G: ${pred.Prediccion_Goleador} | MVP: ${pred.Prediccion_MVP}</span>
                <div class="prediction-actions">
                    <button class="edit-prediction-btn" data-prediction-id="${pred.ID_Prediccion}">Editar</button>
                    <button class="delete-prediction-btn" data-prediction-id="${pred.ID_Prediccion}">Borrar</button>
                </div>
            `;
            container.appendChild(predDiv);
        });
    }
    container.style.display = 'block';

    // Asignamos los eventos a los nuevos botones
    document.querySelectorAll('.edit-prediction-btn').forEach(button => button.addEventListener('click', handleEditPrediction));
    document.querySelectorAll('.delete-prediction-btn').forEach(button => button.addEventListener('click', handleDeletePrediction));
}

async function handleEditPrediction(event) {
    const predictionId = event.target.dataset.predictionId;

    // Buscamos los datos completos de esta predicción
    const response = await fetch(`/predictions/${predictionId}`); // Necesitaremos este endpoint
    if (!response.ok) { showNotification("No se pudieron cargar los datos de la predicción.", "error"); return; }
    const pred = await response.json();

    // Buscamos los datos del partido para saber quiénes son los rivales
    const matchResponse = await fetch(`/matches/${pred.ID_Partido}`);
    const partido = await matchResponse.json();

    // Rellenamos el formulario del modal
    document.getElementById('edit-prediction-id').value = pred.ID_Prediccion;
    document.getElementById('edit-goles-local').value = pred.Prediccion_Goles_Local;
    document.getElementById('edit-goles-visitante').value = pred.Prediccion_Goles_Visitante;

    // Rellenamos los desplegables
    const goleadorSelect = document.getElementById('edit-goleador');
    const mvpSelect = document.getElementById('edit-mvp');

    const plantillaLocal = plantillasEquipos[partido.Equipo_Local] || [];
    const plantillaVisitante = plantillasEquipos[partido.Equipo_Visitante] || [];
    const plantillaMadrid = plantillasEquipos["Real Madrid"] || [];

    goleadorSelect.innerHTML = `<option value="" disabled>Primer Goleador (RM)</option>` + plantillaMadrid.map(p => `<option value="${p}" ${p === pred.Prediccion_Goleador ? 'selected' : ''}>${p}</option>`).join('');
    mvpSelect.innerHTML = `<option value="" disabled>MVP</option>` + [...plantillaLocal, ...plantillaVisitante].map(p => `<option value="${p}" ${p === pred.Prediccion_MVP ? 'selected' : ''}>${p}</option>`).join('');

    // Mostramos el modal
    document.getElementById('edit-modal').style.display = 'flex';
}

// AÑADE ESTAS DOS NUEVAS FUNCIONES A admin.js
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// --- FUNCIÓN NUEVA PARA BORRAR PREDICCIONES ---
async function handleDeletePrediction(event) {
    const button = event.target;
    const predictionId = button.dataset.predictionId;

    if (!confirm(`¿Estás seguro de que quieres borrar la predicción ${predictionId}?`)) {
        return;
    }

    const response = await fetch(`/predictions/${predictionId}`, { method: 'DELETE' });

    if (response.ok) {
        showNotification(`Predicción ${predictionId} borrada con éxito.`, 'success');
        button.closest('.prediction-item').remove();
    } else {
        showNotification('Error al borrar la predicción.', 'error');
    }
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
        // Actualizamos la vista sin recargar
        const row = document.getElementById(`prediction-row-${data.ID_Prediccion}`);
        if (row) {
            const alias = aliasUsuarios[data.Nombre_Usuario_Discord] || data.Nombre_Usuario_Discord;
            row.querySelector('span').innerHTML = `<strong>${alias}</strong>: ${data.Prediccion_Goles_Local}-${data.Prediccion_Goles_Visitante} | G: ${data.Prediccion_Goleador} | MVP: ${data.Prediccion_MVP}`;
        }
        closeEditModal();
    } else {
        showNotification('Error al actualizar.', 'error');
    }
}


// =================================================================================
// FUNCIÓN DE NOTIFICACIONES REUTILIZABLE
// =================================================================================
function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    container.textContent = message;
    container.className = `notification ${type}`; // Usa un nombre de clase base
    container.classList.add(type);
    container.classList.add('show');
    setTimeout(() => {
        container.classList.remove('show');
    }, 3000);
}