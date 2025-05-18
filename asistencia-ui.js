// Estado global de unidades
let asistidasUnidad = 'h'; // por defecto horas
let ausentesUnidad = 'c'; // por defecto clases

// Botones de selección para asistidas
document.getElementById('asistidasHorasBtn').addEventListener('click', function() {
    asistidasUnidad = 'h';
    this.classList.add('selected');
    document.getElementById('asistidasClasesBtn').classList.remove('selected');
});
document.getElementById('asistidasClasesBtn').addEventListener('click', function() {
    asistidasUnidad = 'c';
    this.classList.add('selected');
    document.getElementById('asistidasHorasBtn').classList.remove('selected');
});

// Botones de selección para ausentes
document.getElementById('ausentesHorasBtn').addEventListener('click', function() {
    ausentesUnidad = 'h';
    this.classList.add('selected');
    document.getElementById('ausentesClasesBtn').classList.remove('selected');
});
document.getElementById('ausentesClasesBtn').addEventListener('click', function() {
    ausentesUnidad = 'c';
    this.classList.add('selected');
    document.getElementById('ausentesHorasBtn').classList.remove('selected');
});

// Guardar datos en sessionStorage al enviar
document.getElementById('asistenciaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.classList.remove('error');
    try {
        const horasPorClase = parseFloat(document.getElementById('horasPorClase').value);
        const asistidasValor = document.getElementById('asistidasValor').value;
        const ausentesValor = document.getElementById('ausentesValor').value;
        const totalHorasInput = document.getElementById('totalHorasInput').value;
        const porcentajeMinimo = parseFloat(document.getElementById('porcentajeMinimo').value);
        if (isNaN(porcentajeMinimo) || porcentajeMinimo < 1 || porcentajeMinimo > 100) {
            throw new Error("El porcentaje mínimo debe estar entre 1 y 100.");
        }
        // Guardar en sessionStorage
        sessionStorage.setItem('asistenciaForm', JSON.stringify({
            horasPorClase,
            asistidasValor,
            asistidasUnidad,
            ausentesValor,
            ausentesUnidad,
            totalHorasInput,
            porcentajeMinimo
        }));

        // Codificar datos y actualizar URL
        const datos = {
            horasPorClase,
            asistidasValor,
            asistidasUnidad,
            ausentesValor,
            ausentesUnidad,
            totalHorasInput,
            porcentajeMinimo
        };
        const encoded = encodeAsistenciaData(datos);
        const url = new URL(window.location);
        url.searchParams.set('d', encoded);
        window.history.replaceState({}, '', url);

        const resumen = calcularAsistencia(
            horasPorClase,
            asistidasValor,
            asistidasUnidad,
            ausentesValor,
            ausentesUnidad,
            totalHorasInput,
            porcentajeMinimo
        );
        resultadoDiv.innerHTML = resumen;

        // Mostrar área de compartir con el enlace actualizado
        mostrarShareBox(url.toString());
    } catch (err) {
        resultadoDiv.innerHTML = `<div class="resumen-box"><div style="color:#d93025;text-align:center;padding:24px 0;">${err.message}</div></div>`;
        resultadoDiv.classList.add('error');
        ocultarShareBox();
    }
});

function mostrarShareBox(urlCompleto) {
    const shareBox = document.getElementById('shareBox');
    const shareUrl = document.getElementById('shareUrl');
    const shareMsg = document.getElementById('shareMsg');
    shareBox.style.display = '';
    shareUrl.value = urlCompleto;
    shareMsg.style.display = 'none';
}

function ocultarShareBox() {
    const shareBox = document.getElementById('shareBox');
    shareBox.style.display = 'none';
}

// Evento para el botón compartir
document.getElementById('shareBtn').addEventListener('click', function() {
    const shareUrl = document.getElementById('shareUrl');
    const shareMsg = document.getElementById('shareMsg');
    shareUrl.select();
    shareUrl.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(shareUrl.value).then(() => {
        shareMsg.style.display = '';
        setTimeout(() => { shareMsg.style.display = 'none'; }, 1800);
    }).catch(() => {
        // Si falla, igual selecciona el texto para copiar manualmente
        shareMsg.style.display = 'none';
    });
});

// Al cargar, si hay datos en la URL, decodificarlos y calcular
window.addEventListener('DOMContentLoaded', function() {
    const resultadoDiv = document.getElementById('resultado');
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('d');
    if (encoded) {
        try {
            const d = decodeAsistenciaData(encoded);
            if (d.horasPorClase !== undefined) document.getElementById('horasPorClase').value = d.horasPorClase;
            if (d.asistidasValor !== undefined) document.getElementById('asistidasValor').value = d.asistidasValor;
            if (d.ausentesValor !== undefined) document.getElementById('ausentesValor').value = d.ausentesValor;
            if (d.totalHorasInput !== undefined) document.getElementById('totalHorasInput').value = d.totalHorasInput;
            if (d.porcentajeMinimo !== undefined) document.getElementById('porcentajeMinimo').value = d.porcentajeMinimo;
            // Restaurar botones seleccionados
            if (d.asistidasUnidad === 'h') {
                document.getElementById('asistidasHorasBtn').classList.add('selected');
                document.getElementById('asistidasClasesBtn').classList.remove('selected');
                asistidasUnidad = 'h';
            } else {
                document.getElementById('asistidasClasesBtn').classList.add('selected');
                document.getElementById('asistidasHorasBtn').classList.remove('selected');
                asistidasUnidad = 'c';
            }
            if (d.ausentesUnidad === 'h') {
                document.getElementById('ausentesHorasBtn').classList.add('selected');
                document.getElementById('ausentesClasesBtn').classList.remove('selected');
                ausentesUnidad = 'h';
            } else {
                document.getElementById('ausentesClasesBtn').classList.add('selected');
                document.getElementById('ausentesHorasBtn').classList.remove('selected');
                ausentesUnidad = 'c';
            }
            // Calcular y mostrar resumen automáticamente
            const resumen = calcularAsistencia(
                parseFloat(d.horasPorClase),
                d.asistidasValor,
                d.asistidasUnidad,
                d.ausentesValor,
                d.ausentesUnidad,
                d.totalHorasInput,
                parseFloat(d.porcentajeMinimo)
            );
            resultadoDiv.innerHTML = resumen;
            // Mostrar área de compartir con el enlace actual
            mostrarShareBox(window.location.href);
            return; // No mostrar el placeholder
        } catch (err) {
            resultadoDiv.innerHTML = `<div class="resumen-box"><div style="color:#d93025;text-align:center;padding:24px 0;">Datos en el enlace inválidos.</div></div>`;
            ocultarShareBox();
            return;
        }
    }
    // Si no hay datos válidos, mostrar el placeholder y ocultar compartir
    resultadoDiv.innerHTML = `
        <div class="resumen-box resumen-placeholder">
            <div style="text-align:center;color:#b0b0b0;padding:32px 0;">
                <svg width="48" height="48" fill="none" style="margin-bottom:12px;">
                    <circle cx="24" cy="24" r="22" stroke="#e0e0e0" stroke-width="3"/>
                    <path d="M16 28c2-2 6-2 8 0s6 2 8 0" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="18" cy="20" r="2" fill="#e0e0e0"/>
                    <circle cx="30" cy="20" r="2" fill="#e0e0e0"/>
                </svg>
                <div style="font-size:1.1em;">Aquí verás el resumen de tu asistencia</div>
            </div>
        </div>
    `;
    ocultarShareBox();
});

// Botón para borrar datos de la sesión
document.getElementById('borrarSesionBtn').addEventListener('click', function() {
    sessionStorage.removeItem('asistenciaForm');
    // Limpiar campos
    document.getElementById('horasPorClase').value = '';
    document.getElementById('asistidasValor').value = '';
    document.getElementById('ausentesValor').value = '';
    document.getElementById('totalHorasInput').value = '';
    document.getElementById('porcentajeMinimo').value = 60;
    // Restaurar botones por defecto
    document.getElementById('asistidasHorasBtn').classList.add('selected');
    document.getElementById('asistidasClasesBtn').classList.remove('selected');
    asistidasUnidad = 'h';
    document.getElementById('ausentesClasesBtn').classList.add('selected');
    document.getElementById('ausentesHorasBtn').classList.remove('selected');
    ausentesUnidad = 'c';
    // Limpiar resultado
    document.getElementById('resultado').innerHTML = `
        <div class="resumen-box resumen-placeholder">
            <div style="text-align:center;color:#b0b0b0;padding:32px 0;">
                <svg width="48" height="48" fill="none" style="margin-bottom:12px;">
                    <circle cx="24" cy="24" r="22" stroke="#e0e0e0" stroke-width="3"/>
                    <path d="M16 28c2-2 6-2 8 0s6 2 8 0" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="18" cy="20" r="2" fill="#e0e0e0"/>
                    <circle cx="30" cy="20" r="2" fill="#e0e0e0"/>
                </svg>
                <div style="font-size:1.1em;">Aquí verás el resumen de tu asistencia</div>
            </div>
        </div>
    `;
    // Limpiar parámetro de la URL
    const url = new URL(window.location);
    url.searchParams.delete('d');
    window.history.replaceState({}, '', url);
    ocultarShareBox();
});
