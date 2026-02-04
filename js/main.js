let db = [];
let testSet = [];
let curIdx = 0;
let score = 0;

// Precarga al iniciar
window.onload = async () => {
    try {
        const r = await fetch(`data/vehiculos.json?v=${Date.now()}`);
        db = await r.json();
    } catch (e) {
        console.error("Error cargando datos");
    }
};

function irASeleccion() {
    document.getElementById('pantalla-inicio').classList.add('hidden');
    document.getElementById('menu-seleccion').classList.remove('hidden');
}

function seleccionar(tipo) {
    testSet = tipo === 'todos' ? [...db] : db.filter(v => v.tipo === tipo);
    document.querySelectorAll('.btn-sel').forEach(b => {
        b.classList.remove('selected');
        if(b.innerText.toLowerCase().includes(tipo.substring(0,4))) b.classList.add('selected');
    });
    document.getElementById('status-msg').innerText = `${testSet.length} OBJETIVOS LISTOS`;
    document.getElementById('btn-confirmar').classList.remove('hidden');
}

function iniciarMision() {
    testSet.sort(() => Math.random() - 0.5);
    curIdx = 0;
    score = 0;
    document.getElementById('menu-seleccion').classList.add('hidden');
    document.getElementById('pantalla-juego').classList.remove('hidden');
    renderQuestion();
}

function renderQuestion() {
    const item = testSet[curIdx];
    document.getElementById('txt-progreso').innerText = `OBJ: ${curIdx + 1}/${testSet.length}`;
    document.getElementById('txt-puntos').innerText = `EFIC: ${Math.round((score/(curIdx||1))*100)}%`;
    document.getElementById('img-objetivo').src = item.imagen;
    document.getElementById('pista-text').innerText = item.descripcion;
    document.getElementById('btn-next').classList.add('hidden');
    document.getElementById('feedback-txt').innerText = "";

    const box = document.getElementById('grid-opciones');
    box.innerHTML = '';
    
    item.opciones.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'opcion-btn';
        b.innerText = opt;
        b.onclick = () => check(opt, b);
        box.appendChild(b);
    });
}

function check(pick, el) {
    const correct = testSet[curIdx].nombre;
    const btns = document.querySelectorAll('.opcion-btn');
    btns.forEach(b => b.disabled = true);

    if(pick === correct) {
        el.classList.add('correcto');
        score++;
        document.getElementById('feedback-txt').innerText = "IDENTIFICADO";
        document.getElementById('feedback-txt').style.color = "var(--success)";
    } else {
        el.classList.add('incorrecto');
        document.getElementById('feedback-txt').innerText = `ERROR: ${correct}`;
        document.getElementById('feedback-txt').style.color = "var(--danger)";
        btns.forEach(b => { if(b.innerText === correct) b.classList.add('correcto'); });
    }
    document.getElementById('btn-next').classList.remove('hidden');
}

function proximoObjetivo() {
    curIdx++;
    if(curIdx < testSet.length) renderQuestion();
    else {
        alert(`INFORME FINAL:\nEfectividad: ${Math.round((score/testSet.length)*100)}%\nAciertos: ${score}/${testSet.length}`);
        location.reload();
    }
}
