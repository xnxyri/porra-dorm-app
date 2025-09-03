window.addEventListener('DOMContentLoaded', () => {
    // Rellenamos el desplegable de campeón con los equipos de Champions
    populateSelect('campeon', equiposChampions, "Selecciona un equipo");

    // Activamos la lógica para los desplegables de jugadores filtrados por equipo
    setupPlayerSelectorsChampions();
    
    document.getElementById('champions-prediction-form').addEventListener('submit', handleChampionsSubmit);
});

// Función de ayuda para rellenar desplegables (inteligente)
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

// Lógica para los desplegables de jugadores filtrados en la Champions
function setupPlayerSelectorsChampions() {
    const teamSelectors = document.querySelectorAll('.team-selector');
    
    teamSelectors.forEach(teamSelector => {
        populateSelect(teamSelector, equiposChampions, "Selecciona un equipo");

        teamSelector.addEventListener('change', () => {
            const selectedTeam = teamSelector.value;
            const playerSelectorId = teamSelector.dataset.playerTarget;
            const playerSelector = document.getElementById(playerSelectorId);
            
            // Usamos la base de datos de plantillas de Champions
            let playersToShow = plantillasChampions[selectedTeam] || [];

            populateSelect(playerSelector, playersToShow, "Selecciona un jugador");
        });
    });
}


// Función para enviar el formulario de Champions
async function handleChampionsSubmit(event) {
    event.preventDefault();
    const formData = {
        Nombre_Usuario_Discord: document.getElementById('discord-username').value,
        Competicion: "Champions League",
        Campeon: document.getElementById('campeon').value,
        Pichichi: document.getElementById('pichichi-player').value,
        Max_Asistente: document.getElementById('max-asistente-player').value,
        MVP: document.getElementById('mvp-player').value
    };

    if (!formData.Nombre_Usuario_Discord || !formData.Campeon || !formData.Pichichi || !formData.Max_Asistente || !formData.MVP) {
        showNotification("Debes rellenar todos los campos.", 'error');
        return;
    }

    try {
        const response = await fetch('/season-predictions/champions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail);
        }
        showNotification('¡Predicciones de Champions enviadas con éxito!', 'success');
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