// --- LÓGICA DE FACTOUS ---
const factousData = [
    {
        text: "Zi no hubiera zio por las predicciones especiale, Hamau era Top 3 del DORM y me zua to loh cohone",
        image: "https://cdn.futwiz.com/assets/img/fc25/faces/278349.png?25"
    },
    {
        text: "MRajoy último en el més de Abril. Automáticamente: eu farei 10x se for preciso",
        image: "https://sortitoutsidospaces.b-cdn.net/megapacks/cutoutfaces/originals/2024.12/19302146.png"
    },
    {
        text: "Dije bloque bajo, no ir de los últimos de la tabla, vaffanculo",
        image: "https://cdn.fctoolshub.com/game_assets/fc25/managers/237388.png"
    }
];

function showRandomFactou() {
    const popup = document.getElementById('factous-popup');
    if (!popup) return;

    // Elige un mensaje al azar
    const advice = factousData[Math.floor(Math.random() * factousData.length)];

    // Actualiza el contenido
    document.getElementById('factous-text').textContent = advice.text;
    document.getElementById('factous-image').src = advice.image;

    // Muestra el pop-up
    popup.classList.add('show');

    // Ocúltalo después de 8 segundos
    setTimeout(() => {
        popup.classList.remove('show');
    }, 8000);
}
// -------------------------

// --- LÓGICA PARA EL CAMBIO DE TEMA ---
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.body.classList.add(currentTheme);
        }
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            let theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', theme);
        });
    }
        // El asesor aparecerá de vez en cuando (cada 25 segundos)
    setInterval(showRandomFactou, 25000);
});
// ------------------------------------


// --- LÓGICA PRINCIPAL DE LA PÁGINA ---
window.addEventListener('DOMContentLoaded', () => {
    // Carga los componentes que existan en la página
    if (document.getElementById('hero-carousel')) {
        cargarMemes();
    }
    if (document.getElementById('general-leaderboard-container')) {
        cargarClasificacionGeneral();
        setupMonthSelector();
    }
});


// --- FUNCIONES DE CLASIFICACIÓN ---

// 1. Carga la clasificación GENERAL
async function cargarClasificacionGeneral() {
    try {
        const response = await fetch('/users/');
        const usuarios = await response.json();
        usuarios.sort((a, b) => b.Puntuacion_Total - a.Puntuacion_Total);
        const container = document.getElementById('general-leaderboard-container');
        renderTabla(container, usuarios);
    } catch (error) {
        console.error("Error al cargar la clasificación general:", error);
    }
}

// 2. Prepara el selector de MES
function setupMonthSelector() {
    const selector = document.getElementById('month-selector');
    selector.innerHTML = ''; // Limpiamos el selector por si acaso

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const añoInicio = 2025;
    const añoFin = 2026;

    // Añadimos los meses de 2025 (desde Agosto)
    for (let mes = 7; mes < 12; mes++) { // 7 es Agosto (los meses van de 0 a 11)
        const option = document.createElement('option');
        option.value = `${añoInicio}-${mes + 1}`;
        option.textContent = `${meses[mes]} ${añoInicio}`;
        selector.appendChild(option);
    }

    // Añadimos los meses de 2026 (hasta Mayo)
    for (let mes = 0; mes < 5; mes++) { // 4 es Mayo
        const option = document.createElement('option');
        option.value = `${añoFin}-${mes + 1}`;
        option.textContent = `${meses[mes]} ${añoFin}`;
        selector.appendChild(option);
    }

    // Seleccionamos el último mes disponible por defecto
    selector.selectedIndex = selector.options.length -1;

    // Cargamos la clasificación del mes seleccionado
    cargarClasificacionMensual();

    // Añadimos el listener para cuando cambie el mes
    selector.addEventListener('change', cargarClasificacionMensual);
}

// 3. Carga la clasificación MENSUAL
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

// 4. Función reutilizable para crear las tablas
function renderTabla(container, usuarios) {
    container.innerHTML = '';
    if (usuarios.length === 0) {
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
                    <td>${aliasUsuarios[usuario.Nombre_Usuario_Discord] || usuario.Nombre_Usuario_Discord}</td>
                    <td>${usuario.Puntuacion_Total}</td>
                    <td>${usuario.Win_Streak_Consecutivos || 0}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.appendChild(table);
}

// --- FUNCIÓN PARA CARGAR LOS MEMES ---
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
        document.getElementById('hero-carousel').style.display = 'none';
    }
}