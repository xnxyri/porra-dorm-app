// Listener principal que se ejecuta cuando la página principal (index.html) se carga.
document.addEventListener('DOMContentLoaded', () => {
    
    // Asigna la lógica del botón de tema si existe
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            let theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', theme);
        });
    }

    // Carga los componentes dinámicos de la página
    if (document.getElementById('hero-carousel')) {
        cargarMemes();
    }
    if (document.getElementById('general-leaderboard-container')) {
        cargarClasificacionGeneral();
        setupMonthSelector();
    }
    
    // Activa el asesor "Factous" de forma intermitente
    if(document.getElementById('factous-popup')) {
        setInterval(showRandomFactou, 25000);
    }
});


// =================================================================================
// SECCIÓN DE CLASIFICACIONES
// =================================================================================

// Carga la clasificación GENERAL
async function cargarClasificacionGeneral() {
    try {
        const response = await fetch('/users/');
        const usuarios = await response.json();
        const container = document.getElementById('general-leaderboard-container');
        renderTabla(container, usuarios);
    } catch (error) {
        console.error("Error al cargar la clasificación general:", error);
    }
}

// Prepara el selector de MES
function setupMonthSelector() {
    const selector = document.getElementById('month-selector');
    selector.innerHTML = ''; 

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const añoInicio = 2025;
    const añoFin = 2026;

    for (let mes = 7; mes < 12; mes++) { // 7 es Agosto
        const option = document.createElement('option');
        option.value = `${añoInicio}-${mes + 1}`;
        option.textContent = `${meses[mes]} ${añoInicio}`;
        selector.appendChild(option);
    }
    for (let mes = 0; mes < 5; mes++) { // 4 es Mayo
        const option = document.createElement('option');
        option.value = `${añoFin}-${mes + 1}`;
        option.textContent = `${meses[mes]} ${añoFin}`;
        selector.appendChild(option);
    }

    const fechaActual = new Date();
    let mesPorDefecto = fechaActual.getMonth() + 1;
    let añoPorDefecto = fechaActual.getFullYear();
    
    if (mesPorDefecto === 7 && añoPorDefecto === 2025) {
        mesPorDefecto = 8;
    }

    const valorPorDefecto = `${añoPorDefecto}-${mesPorDefecto}`;
    if (selector.querySelector(`[value="${valorPorDefecto}"]`)) {
        selector.value = valorPorDefecto;
    }
    
    cargarClasificacionMensual();
    selector.addEventListener('change', cargarClasificacionMensual);
}

// Carga la clasificación MENSUAL
async function cargarClasificacionMensual() {
    const selector = document.getElementById('month-selector');
    if (!selector.value) return;
    const [year, month] = selector.value.split('-');
    
    try {
        const response = await fetch(`/leaderboard/monthly?year=${year}&month=${month}`);
        const usuarios = await response.json();
        const container = document.getElementById('monthly-leaderboard-container');
        renderTabla(container, usuarios);
    } catch (error) {
        console.error("Error al cargar la clasificación mensual:", error);
    }
}

// Función reutilizable para crear las tablas de clasificación
function renderTabla(container, usuarios) {
    container.innerHTML = '';
    if (!usuarios || usuarios.length === 0) {
        container.innerHTML = '<p>No hay datos para este periodo.</p>';
        return;
    }
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Pos.</th>
                <th>Usuario</th>
                <th>Puntos</th>
                <th>Racha 🔥</th>
            </tr>
        </thead>
        <tbody>
            ${usuarios.map((usuario, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${usuario.Alias}</td>
                    <td>${usuario.Puntuacion_Total}</td>
                    <td>${usuario.Win_Streak_Consecutivos || 0}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.appendChild(table);
}


// =================================================================================
// SECCIÓN DE MEMES Y FACTOUS
// =================================================================================
async function cargarMemes() {
    try {
        const response = await fetch('/memes/');
        const memes = await response.json();
        const carouselImg = document.getElementById('carousel-image');
        if (!memes || memes.length === 0) {
            document.getElementById('hero-carousel').style.display = 'none';
            return;
        }
        let currentIndex = 0;
        carouselImg.src = memes[currentIndex].URL_Imagen;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % memes.length;
            carouselImg.src = memes[currentIndex].URL_Imagen;
        }, 5000);
    } catch (error) {
        console.error("Error al cargar los memes:", error);
    }
}

function showRandomFactou() {
    const popup = document.getElementById('factous-popup');
    if (!popup || typeof factousData === 'undefined' || factousData.length === 0) return;
    
    const advice = factousData[Math.floor(Math.random() * factousData.length)];
    document.getElementById('factous-text').textContent = advice.text;
    document.getElementById('factous-image').src = advice.image;
    popup.classList.add('show');
    setTimeout(() => { popup.classList.remove('show'); }, 8000);
}