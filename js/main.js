let db = [], pool = [], idx = 0, pts = 0;
let categoria = '', modo = '';

(async function() {
    try {
        const r = await fetch(`data/vehiculos.json?v=${Date.now()}`);
        db = await r.json();
    } catch (e) { console.error("Error DB"); }
})();

function navegar(sale, entra) {
    document.getElementById(sale).classList.remove('activo');
    document.getElementById(entra).classList.add('activo');
    window.scrollTo(0,0);
}

function setCat(c) {
    categoria = c;
    navegar('menu-categorias', 'menu-modos');
}

function setModo(m) {
    modo = m;
    pool = categoria === 'todos' ? [...db] : db.filter(v => v.tipo === categoria);
    pool.sort(() => Math.random() - 0.5);
    idx = 0; pts = 0;
    document.getElementById('label-modo').innerText = `MODO: ${m.toUpperCase()}`;
    navegar('menu-modos', 'pantalla-juego');
    render();
}

function render() {
    const v = pool[idx];
    document.getElementById('label-progreso').innerText = `OBJ: ${idx + 1}/${pool.length}`;
    document.getElementById('label-puntos').innerText = `EFIC: ${Math.round((pts/(idx||1))*100)}%`;
    document.getElementById('img-obj').src = v.imagen;
    
    // Lógica de Pistas según modo
    const zonaPista = document.getElementById('pista-zona');
    zonaPista.innerText = (modo === 'entrenamiento') ? (v.descripcion || "Sin pistas.") : "INTELIGENCIA RESERVADA (Modo Examen/Desafío)";
    
    document.getElementById('feedback-zona').innerText = "";
    document.getElementById('btn-next').classList.add('oculto');

    const caja = document.getElementById('opciones-grid');
    caja.innerHTML = '';
    v.opciones.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'btn-res';
        b.innerText = opt;
        b.onclick = () => validar(opt, b);
        caja.appendChild(b);
    });
}

function validar(esc, btn) {
    const correcta = pool[idx].nombre;
    const btns = document.querySelectorAll('.btn-res');
    btns.forEach(b => b.disabled = true);

    if (esc === correcta) {
        if (modo !== 'examen') btn.classList.add('bien');
        pts++;
        if (modo === 'entrenamiento') document.getElementById('feedback-zona').innerText = "IDENTIFICADO";
    } else {
        if (modo !== 'examen') btn.classList.add('mal');
        if (modo === 'entrenamiento') {
            document.getElementById('feedback-zona').innerText = `FALLO: ${correcta}`;
            btns.forEach(b => { if(b.innerText === correcta) b.classList.add('bien'); });
        }
        if (modo === 'desafio') {
            alert(`DESAFÍO FALLIDO. Identificación incorrecta.\nPuntuación: ${pts}`);
            location.reload(); return;
        }
    }

    if (modo === 'examen') {
        document.getElementById('feedback-zona').innerText = "RESPUESTA REGISTRADA";
        setTimeout(siguiente, 600);
    } else {
        document.getElementById('btn-next').classList.remove('oculto');
    }
}

function siguiente() {
    idx++;
    if (idx < pool.length) render();
    else {
        alert(`FIN DE MISIÓN\nModo: ${modo.toUpperCase()}\nEfectividad: ${Math.round((pts/pool.length)*100)}%`);
        location.reload();
    }
}
