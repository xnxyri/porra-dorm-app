console.log("¿Existe la lista de jugadores?", window.jugadoresRealMadrid);console.log("¿Existe la lista de jugadores?", window.jugadoresRealMadrid);

// Listener principal que se ejecuta cuando carga la página de admin
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const createMatchForm = document.getElementById('create-match-form');
    const createUserForm = document.getElementById('create-user-form');
    const createMemeForm = document.getElementById('create-meme-form');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (createMatchForm) createMatchForm.addEventListener('submit', handleCreateMatch);
    if (createUserForm) createUserForm.addEventListener('submit', handleCreateUser);
    if (createMemeForm) createMemeForm.addEventListener('submit', handleCreateMeme);
});

// --- FUNCIÓN PARA MANEJAR EL LOGIN ---
async function handleLogin(event) {
    event.preventDefault();
    const password = document.getElementById('admin-password').value;
    const formData = new FormData();
    formData.append('password', password);

    try {
        const response = await fetch('/admin/token', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // Si el login es correcto, mostramos el panel de admin y cargamos los partidos
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('admin-panel-section').style.display = 'flex';
            cargarPartidosPorJugar();
            cargarUsuarios();
            cargarMemesAdmin();
        } else {
            showNotification("Error: Contraseña incorrecta", 'error');
        }
    } catch (error) {
        showNotification("Ha ocurrido un error de conexión.", 'error');
    }
}

// --- FUNCIÓN PARA MANEJAR LA CREACIÓN DE PARTIDOS ---
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
        document.getElementById('create-match-form').reset(); // Limpia el formulario
        cargarPartidosPorJugar(); // Recargamos la lista de partidos
    } else {
        showNotification('Error al crear el partido.', 'error');
    }
}

// --- GESTIÓN DE MEMES (NUEVO) ---
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
    // Añadimos listeners a los nuevos botones de borrar
    document.querySelectorAll('.delete-meme-btn').forEach(button => {
        button.addEventListener('click', handleDeleteMeme);
    });
}

async function handleDeleteMatch(event) {
    const button = event.target;
    const matchId = button.dataset.matchId;

    if (!confirm(`¿Estás seguro de que quieres borrar el partido ${matchId}? Esta acción no se puede deshacer.`)) {
        return;
    }

    const response = await fetch(`/matches/${matchId}`, { method: 'DELETE' });

    if (response.ok) {
        showNotification(`Partido ${matchId} borrado con éxito.`, 'success');
        button.closest('.upcoming-match-item').remove(); // Elimina el partido de la vista
    } else {
        const errorData = await response.json();
        showNotification(`Error al borrar: ${errorData.detail}`, 'error');
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
        cargarMemesAdmin(); // Recargamos la lista
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

// --- GESTIÓN DE USUARIOS (NUEVO) ---
async function cargarUsuarios() {
    const response = await fetch('/users/');
    const usuarios = await response.json();
    const container = document.getElementById('users-list-container');
    container.innerHTML = '<ul>';
    usuarios.forEach(user => {
        const alias = aliasUsuarios[user.Nombre_Usuario_Discord] || user.Nombre_Usuario_Discord;
        container.innerHTML += `<li>${alias}</li>`;
    });
    container.innerHTML += '</ul>';
}

async function handleCreateUser(event) {
    event.preventDefault();
    const discordIdInput = document.getElementById('discord-id');
    const userData = { Nombre_Usuario_Discord: discordIdInput.value };

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

// --- FUNCIÓN PARA CARGAR LA LISTA DE PARTIDOS POR FINALIZAR ---
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
            const matchDiv = document.createElement('div');
            matchDiv.className = 'upcoming-match-item';
            // Añadimos un botón de Borrar al lado del de Finalizar
            matchDiv.innerHTML = `
                <div class="match-details">
                    <strong>${partido.Equipo_Local} vs ${partido.Equipo_Visitante}</strong>
                    <span>(Jornada ${partido.Jornada_Numero})</span>
                </div>
                <div class="result-form">
                    <input type="number" placeholder="G. Local" name="goles_local" required>
                    <input type="number" placeholder="G. Visit." name="goles_visitante" required>
                    <select name="goleador_real" required><option value="" disabled selected>Goleador Real</option></select>
                    <select name="mvp_real" required><option value="" disabled selected>MVP Real</option></select>
                    <button class="finalize-btn" data-match-id="${partido.ID_Partido}">Finalizar</button>
                    <button class="delete-match-btn" data-match-id="${partido.ID_Partido}">Borrar</button>
                </div>
            `;
            container.appendChild(matchDiv);
        });

        // Asignamos los eventos a los nuevos botones
        document.querySelectorAll('.finalize-btn').forEach(button => button.addEventListener('click', handleFinalizeMatch));
        document.querySelectorAll('.delete-match-btn').forEach(button => button.addEventListener('click', handleDeleteMatch));

    } catch (error) {
        console.error("Error cargando partidos:", error);
    }
}

// --- FUNCIÓN PARA FINALIZAR UN PARTIDO ---
async function handleFinalizeMatch(event) {
    const button = event.target;
    const matchId = button.dataset.matchId;
    const formDiv = button.closest('.result-form');

    // Leemos los datos de los nuevos desplegables
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

// --- FUNCIÓN REUTILIZABLE PARA MOSTRAR NOTIFICACIONES ---
function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    container.textContent = message;
    container.className = `notification ${type}`;
    container.classList.add('show');
    setTimeout(() => {
        container.classList.remove('show');
    }, 3000);
}