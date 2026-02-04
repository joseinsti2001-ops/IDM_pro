let arsenal = [], test = [], idx = 0, pts = 0;
let sCat = '', sModo = '';
let stats = {}; // Objeto para almacenar las estadísticas de la sesión actual

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
        b.innerText = o;
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
    botones.forEach(b => b.disabled = true);

    if(elegido === correcto) {
        pts++;
        if(sModo !== 'examen') boton.classList.add('ok');
    } else {
        if(sModo !== 'examen') boton.classList.add('ko');
        // --- CAMBIO CLAVE: No recargamos la página en desafío ---
        if(sModo === 'desafio') {
             document.getElementById('msg').innerText = "FALLO CRÍTICO.";
             // Mostramos el botón para ver resultados y terminar la ronda
             document.getElementById('btn-next').classList.remove('oculto');
             // No llamamos a siguiente() aquí, esperamos el click en CONTINUAR
             return; // Salimos para no ejecutar el resto del bloque else
        }
    }

    if(sModo === 'examen') {
        document.getElementById('msg').innerText = "REGISTRADO";
        setTimeout(siguiente, 500);
    } else {
        if(elegido !== correcto) document.getElementById('msg').innerText = `IDENTIFICADO COMO: ${correcto}`;
        document.getElementById('btn-next').classList.remove('oculto');
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
    document.getElementById('pantalla-juego').classList.remove('activo');
    document.getElementById('pantalla-stats').classList.add('activo');

    // Guardar estadísticas del juego actual en la sesión
    const modoActual = sModo;
    const categoriaActual = sCat;
    const total = test.length;
    const aciertos = pts;
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

    const resultadoDetalle = document.createElement('p');
    resultadoDetalle.textContent = `Aciertos: ${aciertos} / ${total} (${total > 0 ? ((aciertos / total) * 100).toFixed(2) : 0}%)`;
    statsContent.appendChild(resultadoDetalle);

    // Mostrar historial de estadísticas anteriores para esta combinación (de la sesión actual)
    const historialTitulo = document.createElement('h3');
    historialTitulo.textContent = 'Historial (Esta Sesión):';
    statsContent.appendChild(historialTitulo);

    const historialLista = document.createElement('ul');
    stats[modoActual][categoriaActual].forEach((partida, index) => {
        const item = document.createElement('li');
        item.textContent = `${partida.fecha}: ${partida.aciertos}/${partida.total} (${((partida.aciertos / partida.total) * 100).toFixed(2)}%)`;
        historialLista.appendChild(item);
    });
    statsContent.appendChild(historialLista);
}

function volverAlMenu() {
    document.getElementById('pantalla-stats').classList.remove('activo');
    document.getElementById('pantalla-menu').classList.add('activo');
    // Opcional: Reiniciar estado del juego si se vuelve al menú
    // idx = 0; pts = 0; test = [];
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
