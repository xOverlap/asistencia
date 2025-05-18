function parseInput(value, horasPorClase) {
    const match = value.trim().toLowerCase().match(/^(\d+)([hc])$/);
    if (!match) {
        throw new Error("Formato inválido. Usa número seguido de 'h' (horas) o 'c' (clases), como 12h o 6c.");
    }
    const cantidad = parseInt(match[1], 10);
    const unidad = match[2];
    if (cantidad < 0) {
        throw new Error("La cantidad no puede ser negativa.");
    }
    if (unidad === 'h') {
        return {
            horas: cantidad,
            clases: cantidad / horasPorClase
        };
    } else {
        return {
            clases: cantidad,
            horas: cantidad * horasPorClase
        };
    }
}

function parseInputNumeroUnidad(valor, unidad, horasPorClase) {
    const cantidad = parseFloat(valor);
    if (isNaN(cantidad) || cantidad < 0) {
        throw new Error("La cantidad debe ser un número no negativo.");
    }
    if (unidad === 'h') {
        return {
            horas: cantidad,
            clases: cantidad / horasPorClase
        };
    } else {
        return {
            clases: cantidad,
            horas: cantidad * horasPorClase
        };
    }
}

function formatIntOrFloat(num) {
    return Number.isInteger(num) ? num : num.toFixed(2);
}

let resumenChart = null;

function renderChart(ctx, porcentajeAsistido, porcentajeAusente) {
    if (resumenChart) {
        resumenChart.destroy();
    }
    resumenChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Asistido', 'Ausente', 'Sin registrar'],
            datasets: [{
                data: [
                    porcentajeAsistido,
                    porcentajeAusente,
                    Math.max(0, 100 - porcentajeAsistido - porcentajeAusente)
                ],
                backgroundColor: [
                    '#4285f4',
                    '#ea4335',
                    '#e0e0e0'
                ],
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 6
            }]
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#5f6368',
                        font: { size: 13 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${formatIntOrFloat(context.parsed)}%`;
                        }
                    }
                }
            }
        }
    });
}

function calcularAsistencia(horasPorClase, asistidasValor, asistidasUnidad, ausentesValor, ausentesUnidad, totalHorasInput, porcentajeMinimo = 60) {
    const asistidas = parseInputNumeroUnidad(asistidasValor, asistidasUnidad, horasPorClase);
    const ausentes = parseInputNumeroUnidad(ausentesValor, ausentesUnidad, horasPorClase);

    const totalHoras = parseFloat(totalHorasInput);
    if (totalHoras <= 0 || horasPorClase <= 0) {
        throw new Error("Las horas totales y horas por clase deben ser mayores que cero.");
    }
    const totalClases = totalHoras / horasPorClase;

    const horasAsistidas = asistidas.horas;
    const horasAusentes = ausentes.horas;
    const horasRestantes = totalHoras - horasAsistidas - horasAusentes;

    const porcentajeAsistido = (horasAsistidas / totalHoras) * 100;
    const porcentajeAusente = (horasAusentes / totalHoras) * 100;
    const porcentajeFaltante = Math.max(0, porcentajeMinimo - porcentajeAsistido);

    const horasMinimasRequeridas = (porcentajeMinimo / 100) * totalHoras;
    const horasQueDebesAsistir = Math.max(0, horasMinimasRequeridas - horasAsistidas);
    const clasesQueDebesAsistir = Math.max(0, Math.ceil(horasQueDebesAsistir / horasPorClase));
    const clasesQuePuedesFaltar = Math.max(0, Math.floor((horasRestantes - horasQueDebesAsistir) / horasPorClase));

    const porcentajeClasesRegistradas = ((horasAsistidas + horasAusentes) / totalHoras) * 100;

    // Resumen con gráfico
    setTimeout(() => {
        const chartCanvas = document.getElementById('resumenChart');
        if (chartCanvas) {
            renderChart(chartCanvas, porcentajeAsistido, porcentajeAusente);
        }
    }, 0);

    return `
    <div class="resumen-box">
        <div class="resumen-chart-container">
            <canvas id="resumenChart" aria-label="Gráfico de asistencia"></canvas>
        </div>
        <div class="resumen-row">
            <span class="resumen-label"><strong>Clases asistidas</strong></span>
            <span class="resumen-value">${Math.round(asistidas.clases)}</span>
        </div>
        <div class="resumen-row">
            <span class="resumen-label"><strong>Horas asistidas</strong></span>
            <span class="resumen-value">${formatIntOrFloat(horasAsistidas)}</span>
        </div>
        <div class="resumen-row">
            <span class="resumen-label"><strong>Clases ausentes</strong></span>
            <span class="resumen-value">${Math.round(ausentes.clases)}</span>
        </div>
        <div class="resumen-row">
            <span class="resumen-label"><strong>Horas ausentes</strong></span>
            <span class="resumen-value">${formatIntOrFloat(horasAusentes)}</span>
        </div>
        <div class="resumen-row">
            <span class="resumen-label">Total de clases planificadas</span>
            <span class="resumen-value">${Math.round(totalClases)}</span>
        </div>
        <div class="resumen-row">
            <span class="resumen-label">Total de horas planificadas</span>
            <span class="resumen-value">${formatIntOrFloat(totalHoras)}</span>
        </div>
        <div class="resumen-row highlight">
            <span class="resumen-label">Asistencia actual</span>
            <span class="resumen-value primary">${formatIntOrFloat(porcentajeAsistido)}%</span>
        </div>
        <div class="resumen-row">
            <span class="resumen-label">Ausencias actuales</span>
            <span class="resumen-value">${formatIntOrFloat(porcentajeAusente)}%</span>
        </div>
        <div class="resumen-row">
            <span class="resumen-label">Clases registradas</span>
            <span class="resumen-value">${formatIntOrFloat(porcentajeClasesRegistradas)}%</span>
        </div>
        <div class="resumen-row">
            <span class="resumen-label">Mínimo requerido</span>
            <span class="resumen-value">${formatIntOrFloat(porcentajeMinimo)}%</span>
        </div>
        <div class="resumen-row">
            <span class="resumen-label">Falta para el mínimo</span>
            <span class="resumen-value danger">${formatIntOrFloat(porcentajeFaltante)}%</span>
        </div>
        <div class="resumen-actions">
            <span class="primary">Debes asistir al menos a <strong>${clasesQueDebesAsistir}</strong> clase(s) más</span>
            <span class="success">Puedes faltar hasta <strong>${clasesQuePuedesFaltar}</strong> clase(s) más</span>
        </div>
    </div>
    `;
}