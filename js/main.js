let db = [], pool = [], idx = 0, pts = 0, selCat = '', selModo = '';

(async function() {
    try {
        const r = await fetch(`data/vehiculos.json?v=${Date.now()}`);
        db = await r.json();
    } catch (e) { console.error("Error cargando base de datos"); }
})();

function navegar(sale, entra) {
    document.getElementById(sale).classList.remove('activo');
    document.getElementById(entra).classList.add('activo');
}

function selectCat(c, btn) {
    selCat = c;
    document.querySelectorAll('.btn-sel.cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    validarConfig();
}

function selectModo(m, btn) {
    selModo = m;
    document.querySelectorAll('.btn-sel.modo').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    validarConfig();
}

function validarConfig() {
    if(selCat && selModo) document.getElementById('btn-ready').classList.remove('inactivo');
}

function iniciarMision() {
    pool = (selCat === 'todos') ? [...db] : db.filter(v => v.tipo === selCat);
    pool.sort(() => Math.random() - 0.5);
    idx = 0; pts = 0;
    document.getElementById('txt-modo').innerText = selModo.toUpperCase();
    navegar('pantalla-config', 'pantalla-juego');
    render();
}

function render() {
    const v = pool[idx];
    document.getElementById('txt-progreso').innerText = `OBJ: ${idx + 1}/${pool.length}`;
    document.getElementById('txt-puntos').innerText = `PTS: ${pts}`;
    document.getElementById('img-obj').src = v.imagen;
    document.getElementById('pista-zona').innerText = (selModo === 'entrenamiento') ? (v.descripcion || "Sin pistas") : "DATOS RESERVADOS";
    document.getElementById('feedback-zona').innerText = "";
    document.getElementById('btn-next').classList.add('oculto');

    const caja = document.getElementById('opciones-grid');
    caja.innerHTML = '';
    v.opciones.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'btn-res';
        b.innerText = opt;
        b.onclick = () => verificar(opt, b);
        caja.appendChild(b);
    });
}

function verificar(esc, btn) {
    const correcta = pool[idx].nombre;
    const btns = document.querySelectorAll('.btn-res');
    btns.forEach(b => b.disabled = true);

    if (esc === correcta) {
        pts++;
        if (selModo !== 'examen') btn.classList.add('bien');
        if (selModo === 'entrenamiento') document.getElementById('feedback-zona').innerText = "IDENTIFICADO";
    } else {
        if (selModo !== 'examen') btn.classList.add('mal');
        if (selModo === 'entrenamiento') {
            document.getElementById('feedback-zona').innerText = `ERROR: ES UN ${correcta}`;
            btns.forEach(b => { if(b.innerText === correcta) b.classList.add('bien'); });
        }
        if (selModo === 'desafio') {
            alert(`DESAFÍO FALLIDO\nPuntos: ${pts}`);
            location.reload(); return;
        }
    }

    if (selModo === 'examen') setTimeout(siguiente, 600);
    else document.getElementById('btn-next').classList.remove('oculto');
}

function siguiente() {
    idx++;
    if (idx < pool.length) render();
    else {
        alert(`FIN DE MISIÓN\nAciertos: ${pts}/${pool.length}`);
        location.reload();
    }
}
