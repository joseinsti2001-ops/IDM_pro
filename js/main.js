let arsenal = [], test = [], idx = 0, pts = 0;
let sCat = '', sModo = '';

(async function() {
    try {
        const r = await fetch(`data/vehiculos.json?v=${Date.now()}`);
        arsenal = await r.json();
    } catch (e) { console.error("Error DB"); }
})();

// Función para la Portada
function entrarAlSistema() {
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
    idx = 0; pts = 0;
    document.getElementById('pantalla-menu').classList.remove('activo');
    document.getElementById('pantalla-juego').classList.add('activo');
    dibujar();
}

function dibujar() {
    const v = test[idx];
    document.getElementById('progreso').innerText = `OBJETIVO: ${idx + 1}/${test.length}`;
    document.getElementById('puntos').innerText = `ACIERTOS: ${pts}`;
    document.getElementById('img-obj').src = v.imagen;
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
        if(sModo === 'desafio') { alert("FALLO CRÍTICO. Operación abortada."); location.reload(); return; }
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
    if(idx < test.length) dibujar();
    else {
        alert(`FIN DEL ENTRENAMIENTO\nAciertos: ${pts}/${test.length}`);
        location.reload();
    }
}
