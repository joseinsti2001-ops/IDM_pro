let arsenal = [], test = [], idx = 0, pts = 0;
let sCat = '', sModo = '';
let stats = {}; // Objeto para almacenar las estadísticas de la sesión actual
let startTime = null; // Variable para almacenar el tiempo de inicio de la ronda
let resultados = []; // Array para almacenar los iconos de acierto/fallo

// --- Manejo de la portada ---
const PORTADA_VISTA_KEY = 'idmil_portada_vista';

function yaVioPortada() {
    return localStorage.getItem(PORTADA_VISTA_KEY) === 'true';
}

function marcarPortadaComoVista() {
    localStorage.setItem(PORTADA_VISTA_KEY, 'true');
}

function entrarAlSistema() {
    marcarPortadaComoVista();
    document.getElementById('pantalla-portada').classList.remove('activo');
    document.getElementById('pantalla-menu').classList.add('activo');
}

function seleccionarCat(c, btn) {
    sCat = c;
    document.querySelectorAll('.cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    chequearReady();
}

function seleccionarModo(m, btn) {
    sModo = m;
    document.querySelectorAll('.modo').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    chequearReady();
}

function chequearReady() {
    if(sCat && sModo) document.getElementById('btn-run').classList.remove('inactivo');
}

function iniciar() {
    test = sCat === 'todos' ? [...arsenal] : arsenal.filter(v => v.tipo === sCat);
    test.sort(() => Math.random() - 0.5);
    idx = 0;
    pts = 0;
    resultados = []; // Inicializar el array de resultados al iniciar
    startTime = new Date().getTime();
    document.getElementById('pantalla-menu').classList.remove('activo');
    document.getElementById('pantalla-juego').classList.add('activo');
    dibujar();
}

// Función auxiliar para mezclar un array (Fisher-Yates Shuffle)
function shuffle(array) {
    const newArray = [...array]; // Copia el array original
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function dibujar() {
    const v = test[idx];
    document.getElementById('progreso').innerText = `OBJETIVO: ${idx + 1}/${test.length}`;
    // Inicializamos el HUD de puntos como vacío, se llenará con iconos
    document.getElementById('puntos').innerHTML = 'RESPUESTAS: ';
    document.getElementById('img-obj').src = v.imagen;
    document.getElementById('img-obj').onerror = function() { this.src = 'assets/placeholder.png'; };
    document.getElementById('pista-zona').innerText = sModo === 'entrenamiento' ? v.descripcion : "INFORMACIÓN CLASIFICADA";
    document.getElementById('msg').innerText = "";
    document.getElementById('btn-next').classList.add('oculto');

    const zona = document.getElementById('opciones-zona');
    zona.innerHTML = '';

    const opcionesMezcladas = shuffle([...v.opciones]);

    opcionesMezcladas.forEach(o => {
        const b = document.createElement('button');
        b.className = 'btn-r';
        b.innerHTML = `<span class="opcion-text">${o}</span>`;
        b.onclick = () => validar(o, b, v.nombre);
        zona.appendChild(b);
    });
}

function abrirZoom() {
    const modal = document.getElementById('modal-zoom');
    document.getElementById('img-zoom').src = test[idx].imagen;
    document.getElementById('img-zoom').onerror = function() { this.src = 'assets/placeholder.png'; };
    modal.style.display = 'flex';
}

function cerrarZoom() {
    document.getElementById('modal-zoom').style.display = 'none';
}

function validar(elegido, boton, nombreCorrecto) {
    const correcto = nombreCorrecto;
    const botones = document.querySelectorAll('.btn-r');
    botones.forEach(b => b.disabled = true);

    // Determinar si fue acierto o fallo
    let resultadoIcono = '';
    if(elegido === correcto) {
        pts++; // Mantenemos la lógica de puntos si se necesita para estadísticas
        boton.classList.add('ok');
        resultadoIcono = '✅'; // Acierto
    } else {
        boton.classList.add('ko');
        resultadoIcono = '❌'; // Fallo
    }

    // Añadir el resultado al array
    resultados.push(resultadoIcono);
    // Actualizar la UI del HUD con los iconos
    actualizarHUD();

    if(elegido === correcto) {
        if(sModo !== 'entrenamiento'){
            // El estilo 'ok' ya se añadió
        }
    } else {
        if(sModo === 'entrenamiento') {
            document.getElementById('msg').innerText = `IDENTIFICADO COMO: ${correcto}`;
        }
        if(sModo === 'desafio') {
             document.getElementById('msg').innerText = "FALLO CRÍTICO.";
             document.getElementById('btn-next').classList.remove('oculto');
             return;
        }
    }

    if(sModo === 'examen') {
        document.getElementById('msg').innerText = "REGISTRADO";
        setTimeout(siguiente, 500);
    } else {
        if(sModo !== 'desafio'){
            document.getElementById('btn-next').classList.remove('oculto');
        }
    }
}

// Nueva función para actualizar el HUD con iconos
function actualizarHUD() {
    const puntosElement = document.getElementById('puntos');
    // Agregar el texto inicial
    puntosElement.innerHTML = 'RESPUESTAS: ';
    // Agregar cada icono del array de resultados
    resultados.forEach(icono => {
        const span = document.createElement('span');
        span.className = 'icono-punto'; // Clase para estilizar
        span.textContent = icono;
        puntosElement.appendChild(span);
    });
}


function siguiente() {
    idx++;
    if(idx < test.length) {
        dibujar();
    } else {
        mostrarResultados();
    }
}

function mostrarResultados() {
    const endTime = new Date().getTime();
    const elapsedTimeMs = endTime - startTime;
    const elapsedTimeSec = (elapsedTimeMs / 1000).toFixed(2);

    document.getElementById('pantalla-juego').classList.remove('activo');
    document.getElementById('pantalla-stats').classList.add('activo');

    const modoActual = sModo;
    const categoriaActual = sCat;
    const total = test.length;
    const aciertos = pts;
    const fallos = total - aciertos;
    const fecha = new Date().toLocaleString();

    if (!stats[modoActual]) {
        stats[modoActual] = {};
    }
    if (!stats[modoActual][categoriaActual]) {
        stats[modoActual][categoriaActual] = [];
    }
    stats[modoActual][categoriaActual].push({
        total: total,
        aciertos: aciertos,
        fallos: fallos,
        tiempo: elapsedTimeSec,
        fecha: fecha
    });

    const statsContent = document.getElementById('stats-content');
    statsContent.innerHTML = '';

    const tituloStats = document.createElement('h2');
    tituloStats.textContent = `RESULTADOS DE LA PARTIDA`;
    statsContent.appendChild(tituloStats);

    const resumenDiv = document.createElement('div');
    resumenDiv.className = 'resumen-partida';

    const tituloPartida = document.createElement('h3');
    tituloPartida.textContent = `Partida Finalizada`;
    resumenDiv.appendChild(tituloPartida);

    const detalleCategoria = document.createElement('p');
    detalleCategoria.textContent = `Categoría: ${categoriaActual.toUpperCase()}`;
    resumenDiv.appendChild(detalleCategoria);

    const detalleModo = document.createElement('p');
    detalleModo.textContent = `Modo: ${modoActual.toUpperCase()}`;
    resumenDiv.appendChild(detalleModo);

    const detalleResultados = document.createElement('div');
    detalleResultados.className = 'resultados-detalle';

    const aciertosSpan = document.createElement('span');
    aciertosSpan.className = 'stat-item aciertos';
    aciertosSpan.textContent = `Aciertos: ${aciertos}`;
    detalleResultados.appendChild(aciertosSpan);

    const fallosSpan = document.createElement('span');
    fallosSpan.className = 'stat-item fallos';
    fallosSpan.textContent = `Fallos: ${fallos}`;
    detalleResultados.appendChild(fallosSpan);

    const totalSpan = document.createElement('span');
    totalSpan.className = 'stat-item total';
    totalSpan.textContent = `Total: ${total}`;
    detalleResultados.appendChild(totalSpan);

    const tiempoSpan = document.createElement('span');
    tiempoSpan.className = 'stat-item tiempo';
    tiempoSpan.textContent = `Tiempo: ${elapsedTimeSec}s`;
    detalleResultados.appendChild(tiempoSpan);

    resumenDiv.appendChild(detalleResultados);

    const porcentajeSpan = document.createElement('p');
    porcentajeSpan.className = 'porcentaje';
    const porcentaje = total > 0 ? ((aciertos / total) * 100).toFixed(2) : 0;
    porcentajeSpan.textContent = `Rendimiento: ${porcentaje}%`;
    resumenDiv.appendChild(porcentajeSpan);

    statsContent.appendChild(resumenDiv);

    const historialTitulo = document.createElement('h3');
    historialTitulo.textContent = 'Historial (Esta Sesión):';
    statsContent.appendChild(historialTitulo);

    const historialLista = document.createElement('ul');
    stats[modoActual][categoriaActual].forEach((partida, index) => {
        const item = document.createElement('li');
        item.className = 'historial-item';
        const porcentajeHistorial = ((partida.aciertos / partida.total) * 100).toFixed(2);
        item.textContent = `${partida.fecha}: ${partida.aciertos}/${partida.total} (${porcentajeHistorial}%), F: ${partida.fallos}, T: ${partida.tiempo}s`;
        historialLista.appendChild(item);
    });
    statsContent.appendChild(historialLista);
}


function interrumpirPrueba() {
    if (confirm("¿Estás seguro de que deseas interrumpir la prueba actual?")) {
        mostrarResultados();
    }
}

function volverAlMenu() {
    document.getElementById('pantalla-stats').classList.remove('activo');
    document.getElementById('pantalla-menu').classList.add('activo');
    // No reiniciamos estado aquí si se vuelve al menú
}

// --- INICIALIZACIÓN ---
(async function() {
    try {
        const r = await fetch(`data/vehiculos.json?v=${Date.now()}`);
        arsenal = await r.json();
        const savedStats = localStorage.getItem('idmil_stats');
        if (savedStats) {
            stats = JSON.parse(savedStats);
        }
    } catch (e) {
        console.error("Error al cargar la base de datos de vehículos:", e);
         alert("Error al cargar los datos del juego. Por favor, recarga la página.");
    }

    if (yaVioPortada()) {
        document.getElementById('pantalla-portada').classList.remove('activo');
        document.getElementById('pantalla-menu').classList.add('activo');
    }
})();
