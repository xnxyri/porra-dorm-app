window.addEventListener('DOMContentLoaded', () => {
    cargarPrediccionesChampions();
});

async function cargarPrediccionesChampions() {
    const container = document.getElementById('table-container');
    container.innerHTML = '<p>Cargando...</p>';

    try {
        const response = await fetch('/season-predictions/Champions League');
        const predicciones = await response.json();

        if (predicciones.length === 0) {
            container.innerHTML = '<p>No hay predicciones de Champions guardadas.</p>';
            return;
        }

        let tableHtml = `
            <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Campeón</th>
                        <th>Pichichi</th>
                        <th>Max. Asist.</th>
                        <th>MVP</th>
                    </tr>
                </thead>
                <tbody>
                    ${predicciones.map(pred => `
                        <tr>
                            <td><strong>${pred.Alias}</strong></td>
                            <td>${pred.Campeon}</td>
                            <td>${pred.Pichichi}</td>
                            <td>${pred.Max_Asistente}</td>
                            <td>${pred.MVP}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            </div>
        `;
        container.innerHTML = tableHtml;
    } catch (error) {
        container.innerHTML = '<p>Error al cargar las predicciones.</p>';
        console.error("Error cargando predicciones de Champions:", error);
    }
}