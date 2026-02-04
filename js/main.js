let arsenal = [], test = [], idx = 0, pts = 0;
let selCat = '', selModo = '';

(async function() {
    const r = await fetch(`data/vehiculos.json?v=${Date.now()}`);
    arsenal = await r.json();
})();

function elegirCat(c, btn) {
    selCat = c;
    document.querySelectorAll('.cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    validar();
}

function elegirModo(m, btn) {
    selModo = m;
    document.querySelectorAll('.modo').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    validar();
}

function validar() {
    if(selCat && selModo) document.getElementById('btn-start').classList.remove('inactivo');
}

function comenzar() {
    test = selCat === 'todos' ? [...arsenal] : arsenal.filter(v => v.tipo === selCat);
    test.sort(() => Math.random() - 0.5);
    idx = 0; pts = 0;
    document.getElementById('info-modo').innerText = selModo.toUpperCase();
    document.getElementById('pantalla-menu').classList.remove('activo');
    document.getElementById('pantalla-juego').classList.add('activo');
    render();
}

function render() {
    const v = test[idx];
    document.getElementById('info-obj').innerText = `${idx + 1}/${test.length}`;
    document.getElementById('info-pts').innerText = `PTS: ${pts}`;
    document.getElementById('img-target').src = v.imagen;
    document.getElementById('pista-txt').innerText = selModo === 'entrenamiento' ? v.descripcion : "---";
    document.getElementById('feedback').innerText = "";
    document.getElementById('btn-next').classList.add('oculto');

    const box = document.getElementById('opciones-box');
    box.innerHTML = '';
    v.opciones.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'btn-ans';
        b.innerText = opt;
        b.onclick = () => chequear(opt, b);
        box.appendChild(b);
    });
}

function chequear(esc, btn) {
    const ok = test[idx].nombre;
    const btns = document.querySelectorAll('.btn-ans');
    btns.forEach(b => b.disabled = true);

    if(esc === ok) {
        pts++;
        if(selModo !== 'examen') btn.classList.add('correct');
    } else {
        if(selModo !== 'examen') btn.classList.add('wrong');
        if(selModo === 'desafio') { alert("FALLO. Fin de misión."); location.reload(); return; }
    }

    if(selModo === 'examen') setTimeout(siguiente, 500);
    else {
        if(esc !== ok) document.getElementById('feedback').innerText = `ES UN ${ok}`;
        document.getElementById('btn-next').classList.remove('oculto');
    }
}

function siguiente() {
    idx++;
    if(idx < test.length) render();
    else {
        alert(`Misión terminada. Aciertos: ${pts}/${test.length}`);
        location.reload();
    }
}
