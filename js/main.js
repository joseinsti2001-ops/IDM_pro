let vehiculos = [];
let preguntas = [];
let preguntaActual = 0;
let aciertos = 0;
let categoriaActual = '';

// Iniciar aplicación
function comenzarApp() {
    document.getElementById('pantalla-inicio').classList.add('hidden');
    document.getElementById('menu-seleccion').classList.remove('hidden');
    cargarDatos();
}

async function cargarDatos() {
    try {
        const respuesta = await fetch('data/vehiculos.json');
        vehiculos = await respuesta.json();
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
}

function seleccionarCategoria(cat) {
    categoriaActual = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('selected');
        if(btn.innerText.toLowerCase().includes(cat.substring(0,5))) btn.classList.add('selected');
    });
    document.getElementById('info-seleccion').innerText = `LISTO PARA OPERAR: ${cat.toUpperCase()}`;
    document.getElementById('btn-jugar').classList.remove('hidden');
}

function iniciarJuego() {
    // Filtrar preguntas
    if (categoriaActual === 'todos') {
        preguntas = [...vehiculos];
    } else {
        preguntas = vehiculos.filter(v => v.tipo === categoriaActual);
    }

    // Mezclar orden
    preguntas.sort(() => Math.random() - 0.5);
    
    preguntaActual = 0;
    aciertos = 0;
    
    document.getElementById('menu-seleccion').classList.add('hidden');
    document.getElementById('pantalla-juego').classList.remove('hidden');
    mostrarPregunta();
}

function mostrarPregunta() {
    const v = preguntas[preguntaActual];
    document.getElementById('contador').innerText = `Vehículo: ${preguntaActual + 1} / ${preguntas.length}`;
    document.getElementById('puntuacion').innerText = `Aciertos: ${aciertos}`;
    document.getElementById('imagen-vehiculo').src = v.imagen;
    document.getElementById('descripcion-pista').innerText = v.descripcion;
    document.getElementById('feedback').innerText = '';
    document.getElementById('btn-siguiente').classList.add('hidden');

    const contenedorOpciones = document.getElementById('opciones');
    contenedorOpciones.innerHTML = '';

    v.opciones.forEach(opcion => {
        const btn = document.createElement('button');
        btn.className = 'opcion-btn';
        btn.innerText = opcion;
        btn.onclick = () => verificarRespuesta(opcion, btn);
        contenedorOpciones.appendChild(btn);
    });
}

function verificarRespuesta(respuesta, boton) {
    const correcta = preguntas[preguntaActual].nombre;
    const botones = document.querySelectorAll('.opcion-btn');
    
    botones.forEach(b => b.disabled = true);

    if (respuesta === correcta) {
        boton.classList.add('correcto');
        aciertos++;
        document.getElementById('feedback').innerText = "¡CORRECTO!";
        document.getElementById('feedback').style.color = "var(--green)";
    } else {
        boton.classList.add('incorrecto');
        document.getElementById('feedback').innerText = `ERROR. ES UN: ${correcta}`;
        document.getElementById('feedback').style.color = "var(--red)";
        
        // Marcar la correcta para aprender
        botones.forEach(b => {
            if(b.innerText === correcta) b.classList.add('correcto');
        });
    }
    document.getElementById('btn-siguiente').classList.remove('hidden');
}

function siguientePregunta() {
    preguntaActual++;
    if (preguntaActual < preguntas.length) {
        mostrarPregunta();
    } else {
        alert(`Entrenamiento finalizado. Aciertos: ${aciertos} de ${preguntas.length}`);
        location.reload();
    }
}
