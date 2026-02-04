let arsenal = [], test = [], idx = 0, pts = 0;
let sCat = '', sModo = '';
let stats = {}; // Objeto para almacenar las estadísticas de la sesión actual
let startTime = null; // Variable para almacenar el tiempo de inicio de la ronda
let aciertosContador = 0; // Contador para aciertos
let fallosContador = 0; // Contador para fallos

// --- Manejo de la portada ---
// REMOVIDO: const PORTADA_VISTA_KEY = 'idmil_portada_vista';
// REMOVIDO: function yaVioPortada()
// REMOVIDO: function marcarPortadaComoVista()

function entrarAlSistema() {
    // REMOVIDO: marcarPortadaComoVista();
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
    aciertosContador = 0; // Reiniciar contadores
    fallosContador = 0;
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
    // Actualizar HUD con contadores
    actualizarHUD();
    document.getElementById('img-obj').src = v.imagen;
    document.getElementById('img-obj').onerror = function() { this.src = 'assets/placeholder.png'; };
    document.getElementById('pista-zona').innerText = sModo === 'entrenamiento' ? v.descripcion : "INFORMACIÓN CLASIFICADA";
    document.getElementById('msg').innerText = "";
    document.getElementById('btn-next').classList.add('oculto'); // Ocultar botón continuar por defecto

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
    botones.forEach(b => b.disabled = true); // Deshabilitar botones inmediatamente

    // Determinar si fue acierto o fallo e incrementar contador
    if(elegido === correcto) {
        pts++;
        aciertosContador++; // Incrementar contador de aciertos
        boton.classList.add('ok');
    } else {
        fallosContador++; // Incrementar contador de fallos
        boton.classList.add('ko');
    }

    // Actualizar la UI del HUD con los contadores
    actualizarHUD();

    if(elegido === correcto) {
        // En examen y desafío, se marca el botón pero no el texto adicional
        if(sModo !== 'entrenamiento'){
            // El estilo 'ok' ya se añadió arriba
            // En examen, mostrar el botón de continuar DESPUÉS de un delay
            if(sModo === 'examen') {
                 document.getElementById('msg').innerText = "REGISTRADO";
                 setTimeout(() => {
                     document.getElementById('btn-next').classList.remove('oculto');
                 }, 500); // 500ms de delay
                 return; // Salimos para no ejecutar el resto del bloque else
            }
            // En desafío, si acierta, no pasa nada más, continúa
            if(sModo === 'desafio') {
                 // Continuar sin hacer nada más aquí, el botón next no se muestra
                 // La ronda termina si falla o si completa todas
                 return; // <-- ESTE RETURN es crucial para que continue
            }
        }
        // En entrenamiento, si acierta, mostrar mensaje y botón continuar
        if(sModo === 'entrenamiento') {
             document.getElementById('msg').innerText = "¡Correcto!";
             document.getElementById('btn-next').classList.remove('oculto');
        }
    } else {
        // Mostrar el nombre correcto en entrenamiento
        if(sModo === 'entrenamiento') {
            document.getElementById('msg').innerText = `IDENTIFICADO COMO: ${correcto}`;
            document.getElementById('btn-next').classList.remove('oculto'); // Mostrar botón para continuar
        }
        // --- CORRECCIÓN CRÍTICA: Modo Desafío ---
        if(sModo === 'desafio') {
             document.getElementById('msg').innerText = "FALLO CRÍTICO.";
             // Mostrar botón de continuar (opcional, puede quitarse si se va directo)
             document.getElementById('btn-next').classList.remove('oculto');
             // *** TERMINAR LA RONDA INMEDIATAMENTE ***
             // No incrementamos idx aquí, dejamos que siguiente() lo haga y termine
             // Al llamar a siguiente() inmediatamente, se termina la ronda
             // Opcional: Puedes usar un timeout para dar un breve feedback visual
             setTimeout(() => {
                 siguiente();
             }, 1000); // Esperar 1 segundo antes de ir a estadísticas
             return; // Salir de validar para evitar más ejecución
        }
    }

    // Este bloque else no se ejecutará si se entra en alguna condición anterior con return
    // if(sModo === 'examen') {
    //     document.getElementById('msg').innerText = "REGISTRADO";
    //     setTimeout(siguiente, 500);
    // } else {
    //     if(sModo !== 'desafio'){
    //         document.getElementById('btn-next').classList.remove('oculto');
    //     }
    // }
}

// Nueva función para actualizar el HUD con contadores resumidos
function actualizarHUD() {
    const puntosElement = document.getElementById('puntos');
    // Construir el texto con los contadores
    puntosElement.innerHTML = `RESPUESTAS: ✅ ${aciertosContador} ❌ ${fallosContador}`;
}

function siguiente() {
    idx++;
    if(idx < test.length) {
        dibujar(); // Cargar siguiente pregunta si no hemos terminado
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
    // CORREGIDO: Usamos los contadores locales para estadísticas
    const aciertos = aciertosContador;
    const fallos = fallosContador;
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

    const resumenDiv = document.createElement('div');
    resumenDiv.className = 'resumen-partada';

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

    // Mostrar historial de estadísticas anteriores para esta combinación (de la sesión actual)
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
    // Opcional: Reiniciar estado del juego si se vuelve al menú
    // idx = 0; pts = 0; test = []; startTime = null; aciertosContador = 0; fallosContador = 0;
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
    // Siempre mostrar la portada al inicio
    // No se hace nada, la portada ya está activa por defecto en el HTML.
    console.log("DEBUG: Script cargado, mostrando portada por defecto.");
})();
