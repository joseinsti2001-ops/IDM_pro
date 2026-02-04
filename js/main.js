let arsenal = [], test = [], idx = 0, pts = 0;
let sCat = '', sModo = '';
let stats = {}; // Objeto para almacenar las estadísticas de la sesión actual
let startTime = null; // Variable para almacenar el tiempo de inicio de la ronda

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
    // Reiniciar tiempo al iniciar una nueva ronda
    startTime = new Date().getTime();
    document.getElementById('pantalla-menu').classList.remove('activo');
    document.getElementById('pantalla-juego').classList.add('activo');
    dibujar();
}

function dibujar() {
    const v = test[idx];
    document.getElementById('progreso').innerText = `OBJETIVO: ${idx + 1}/${test.length}`;
    document.getElementById('puntos').innerText = `ACIERTOS: ${pts}`;
    document.getElementById('img-obj').src = v.imagen;
    // Opcional: Manejo de error de imagen
    document.getElementById('img-obj').onerror = function() { this.src = 'assets/placeholder.png'; };
    document.getElementById('pista-zona').innerText = sModo === 'entrenamiento' ? v.descripcion : "INFORMACIÓN CLASIFICADA";
    document.getElementById('msg').innerText = "";
    document.getElementById('btn-next').classList.add('oculto');

    const zona = document.getElementById('opciones-zona');
    zona.innerHTML = '';
    v.opciones.forEach(o => {
        const b = document.createElement('button');
        b.className = 'btn-r';
        b.innerHTML = `<span class="opcion-text">${o}</span>`; // Contenedor para el texto
        b.onclick = () => validar(o, b);
        zona.appendChild(b);
    });
}

function abrirZoom() {
    const modal = document.getElementById('modal-zoom');
    document.getElementById('img-zoom').src = test[idx].imagen;
    // Opcional: Manejo de error de imagen en zoom
    document.getElementById('img-zoom').onerror = function() { this.src = 'assets/placeholder.png'; };
    modal.style.display = 'flex';
}

function cerrarZoom() {
    document.getElementById('modal-zoom').style.display = 'none';
}

function validar(elegido, boton) {
    const correcto = test[idx].nombre;
    const botones = document.querySelectorAll('.btn-r');
    botones.forEach(b => b.disabled = true); // Deshabilitar todos los botones

    // Añadir icono de acierto o fallo
    if(elegido === correcto) {
        pts++;
        boton.classList.add('ok');
        boton.innerHTML += ' <span class="icono-respuesta">✅</span>'; // Añadir tick
    } else {
        boton.classList.add('ko');
        boton.innerHTML += ' <span class="icono-respuesta">❌</span>'; // Añadir cruz
    }

    if(elegido === correcto) {
        // En examen y desafío, se muestra el tick pero no el texto
        if(sModo !== 'entrenamiento'){
            // El tick ya se añadió arriba
        }
    } else {
        // Mostrar el nombre correcto en entrenamiento
        if(sModo === 'entrenamiento') {
            document.getElementById('msg').innerText = `IDENTIFICADO COMO: ${correcto}`;
        }
        // En desafío, preparar para terminar
        if(sModo === 'desafio') {
             document.getElementById('msg').innerText = "FALLO CRÍTICO.";
             document.getElementById('btn-next').classList.remove('oculto');
             return; // Salimos para no ejecutar el resto del bloque else
        }
    }

    if(sModo === 'examen') {
        document.getElementById('msg').innerText = "REGISTRADO";
        setTimeout(siguiente, 500);
    } else {
        // En entrenamiento, mostrar el botón de siguiente
        if(sModo !== 'desafio'){ // No mostrar si ya estamos en el paso de desafío
            document.getElementById('btn-next').classList.remove('oculto');
        }
    }
}

function siguiente() {
    idx++;
    if(idx < test.length) {
        dibujar();
    } else {
        // El juego ha terminado, ya sea por éxito o fallo en desafío
        mostrarResultados();
    }
}

function mostrarResultados() {
    // Calcular tiempo transcurrido
    const endTime = new Date().getTime();
    const elapsedTimeMs = endTime - startTime;
    const elapsedTimeSec = (elapsedTimeMs / 1000).toFixed(2);

    document.getElementById('pantalla-juego').classList.remove('activo');
    document.getElementById('pantalla-stats').classList.add('activo');

    // Guardar estadísticas del juego actual en la sesión
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

    // Mostrar estadísticas en pantalla
    const statsContent = document.getElementById('stats-content');
    statsContent.innerHTML = '';

    const tituloStats = document.createElement('h2');
    tituloStats.textContent = `RESULTADOS DE LA PARTIDA`;
    statsContent.appendChild(tituloStats);

    const resultadoActual = document.createElement('p');
    resultadoActual.textContent = `Categoría: ${categoriaActual.toUpperCase()}, Modo: ${modoActual.toUpperCase()}`;
    statsContent.appendChild(resultadoActual);

    const detalle = document.createElement('p');
    detalle.textContent = `Aciertos: ${aciertos} / ${total} (${total > 0 ? ((aciertos / total) * 100).toFixed(2) : 0}%), ` +
                          `Fallos: ${fallos}, Tiempo: ${elapsedTimeSec}s`;
    statsContent.appendChild(detalle);

    // Mostrar historial de estadísticas anteriores para esta combinación (de la sesión actual)
    const historialTitulo = document.createElement('h3');
    historialTitulo.textContent = 'Historial (Esta Sesión):';
    statsContent.appendChild(historialTitulo);

    const historialLista = document.createElement('ul');
    stats[modoActual][categoriaActual].forEach((partida, index) => {
        const item = document.createElement('li');
        item.textContent = `${partida.fecha}: ${partida.aciertos}/${partida.total} (${((partida.aciertos / partida.total) * 100).toFixed(2)}%), ` +
                           `F: ${partida.fallos}, T: ${partida.tiempo}s`;
        historialLista.appendChild(item);
    });
    statsContent.appendChild(historialLista);
}

function interrumpirPrueba() {
    if (confirm("¿Estás seguro de que deseas interrumpir la prueba actual?")) {
        mostrarResultados(); // Ir directamente a estadísticas
    }
}

function volverAlMenu() {
    document.getElementById('pantalla-stats').classList.remove('activo');
    document.getElementById('pantalla-menu').classList.add('activo');
    // Opcional: Reiniciar estado del juego si se vuelve al menú
    // idx = 0; pts = 0; test = []; startTime = null;
}

// --- INICIALIZACIÓN ---
(async function() {
    try {
        const r = await fetch(`data/vehiculos.json?v=${Date.now()}`);
        arsenal = await r.json();
        // Cargar estadísticas guardadas (si existen) desde localStorage al inicio
        const savedStats = localStorage.getItem('idmil_stats');
        if (savedStats) {
            stats = JSON.parse(savedStats);
        }
    } catch (e) {
        console.error("Error al cargar la base de datos de vehículos:", e);
         // Opcional: Mostrar un mensaje de error en la UI
         alert("Error al cargar los datos del juego. Por favor, recarga la página.");
    }

    // --- Decidir qué pantalla mostrar al cargar ---
    if (yaVioPortada()) {
        document.getElementById('pantalla-portada').classList.remove('activo');
        document.getElementById('pantalla-menu').classList.add('activo');
    }
    // Si no ha visto la portada, la pantalla 'activo' por defecto ya es la portada
})();
