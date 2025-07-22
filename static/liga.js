window.addEventListener('DOMContentLoaded', () => {
    // 1. Llenamos todos los desplegables de equipos
    const allTeamSelects = document.querySelectorAll('#campeon, .ucl-spot, .el-spot, #conference-spot, .descenso-spot');
    allTeamSelects.forEach(select => {
        populateSelect(select, equiposLaLiga, "Selecciona un equipo");
        // 2. A cada uno le añadimos el listener para que actualice los demás
        select.addEventListener('change', () => updateTeamSelectOptions(allTeamSelects));
    });
    
    // 3. Activamos la lógica para los selectores de jugadores
    setupPlayerSelectors();

    // 4. Asignamos el evento al formulario
    document.getElementById('liga-prediction-form').addEventListener('submit', handleSeasonSubmit);
});

// --- NUEVA FUNCIÓN DE VALIDACIÓN ---
function updateTeamSelectOptions(allSelects) {
    // Primero, creamos un conjunto con todos los equipos que ya han sido seleccionados
    const selectedValues = new Set();
    allSelects.forEach(select => {
        if (select.value) {
            selectedValues.add(select.value);
        }
    });

    // Ahora, recorremos todos los desplegables de nuevo
    allSelects.forEach(select => {
        // Recorremos cada opción dentro de cada desplegable
        select.querySelectorAll('option').forEach(option => {
            // Si la opción no está vacía y ya ha sido seleccionada en OTRO desplegable...
            if (option.value && selectedValues.has(option.value) && option.value !== select.value) {
                // ...la deshabilitamos para que no se pueda elegir.
                option.disabled = true;
            } else {
                // Si no, la habilitamos.
                option.disabled = false;
            }
        });
    });
}


// Función reutilizable para llenar desplegables
function populateSelect(element, options, placeholder) {
    const select = (typeof element === 'string') ? document.getElementById(element) : element;
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
}

// Lógica para los desplegables de jugadores filtrados
function setupPlayerSelectors() {
    const teamSelectors = document.querySelectorAll('.team-selector');
    teamSelectors.forEach(teamSelector => {
        populateSelect(teamSelector, equiposLaLiga, "Selecciona un equipo");
        teamSelector.addEventListener('change', () => {
            const selectedTeam = teamSelector.value;
            const playerSelectorId = teamSelector.dataset.playerTarget;
            const playerSelector = document.getElementById(playerSelectorId);
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

// Función para enviar el formulario
async function handleSeasonSubmit(event) {
    event.preventDefault();
    const formData = {
        Nombre_Usuario_Discord: document.getElementById('discord-username').value,
        Competicion: "LaLiga",
        Campeon: document.getElementById('campeon').value,
        Clasificados_UCL: Array.from(document.querySelectorAll('.ucl-spot')).map(s => s.value),
        Clasificados_EL: Array.from(document.querySelectorAll('.el-spot')).map(s => s.value),
        Clasificado_Conference: document.getElementById('conference-spot').value,
        Descensos: Array.from(document.querySelectorAll('.descenso-spot')).map(s => s.value),
        Pichichi: document.getElementById('pichichi-player').value,
        Max_Asistente: document.getElementById('max-asistente-player').value,
        Zamora: document.getElementById('zamora-player').value,
        Zarra: document.getElementById('zarra-player').value,
        MVP: document.getElementById('mvp-player').value
    };
    if (Object.values(formData).some(val => !val || (Array.isArray(val) && val.some(v => !v)))) {
        showNotification("Debes rellenar todos los campos.", 'error');
        return;
    }
    try {
        const response = await fetch('/season-predictions/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail);
        }
        showNotification('¡Predicciones de temporada enviadas con éxito!', 'success');
        setTimeout(() => { window.location.href = "/"; }, 2000);
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Función de notificación
function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    container.textContent = message;
    container.className = 'notification';
    container.classList.add(type);
    container.classList.add('show');
    setTimeout(() => container.classList.remove('show'), 3000);
}