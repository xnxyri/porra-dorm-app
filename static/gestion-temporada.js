window.addEventListener('DOMContentLoaded', () => {
    cargarPrediccionesDeTemporada();
});

async function cargarPrediccionesDeTemporada() {
    const container = document.getElementById('table-container');
    container.innerHTML = '<p>Cargando...</p>';

    const response = await fetch('/season-predictions/LaLiga');
    const predicciones = await response.json();

    if (predicciones.length === 0) {
        container.innerHTML = '<p>No hay predicciones guardadas.</p>';
        return;
    }

    let tableHtml = `
        <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Campeón</th>
                    <th>UCL</th>
                    <th>Europa L.</th>
                    <th>Conference</th>
                    <th>Descenso</th>
                    <th>Pichichi</th>
                    <th>Max Asist.</th>
                    <th>Zamora</th>
                    <th>Zarra</th>
                    <th>MVP</th>
                </tr>
            </thead>
            <tbody>
                ${predicciones.map(pred => `
                    <tr>
                        <td><strong>${pred.Alias}</strong></td>
                        <td>${pred.Campeon}</td>
                        <td>${pred.Clasificados_UCL.join('<br>')}</td>
                        <td>${pred.Clasificados_EL.join('<br>')}</td>
                        <td>${pred.Clasificado_Conference}</td>
                        <td>${pred.Descensos.join('<br>')}</td>
                        <td>${pred.MVP || 'N/A'}</td>
                        <td>${pred.Pichichi}</td>
                        <td>${pred.Max_Asistente}</td>
                        <td>${pred.Zamora}</td>
                        <td>${pred.Zarra}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
        `;
    container.innerHTML = tableHtml;
}