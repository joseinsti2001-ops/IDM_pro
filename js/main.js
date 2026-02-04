let db = [];
let quiz = [];
let current = 0;
let points = 0;

// Cargar datos al entrar
async function load() {
    try {
        const r = await fetch(`data/vehiculos.json?v=${Date.now()}`);
        db = await r.json();
    } catch (e) { console.error("Error cargando JSON"); }
}
load();

function navegar(sale, entra) {
    document.getElementById(sale).classList.remove('active');
    document.getElementById(entra).classList.add('active');
}

function seleccionar(tipo) {
    quiz = tipo === 'todos' ? [...db] : db.filter(v => v.tipo === tipo);
    
    document.querySelectorAll('.btn-opt').forEach(b => {
        b.classList.remove('selected');
        if(b.innerText.toLowerCase().includes(tipo.substring(0,3))) b.classList.add('selected');
    });

    document.getElementById('status-msg').innerText = `${quiz.length} objetivos cargados.`;
    document.getElementById('btn-confirmar').classList.remove('hidden');
}

function iniciarMision() {
    quiz.sort(() => Math.random() - 0.5);
    current = 0;
    points = 0;
    navegar('menu-seleccion', 'pantalla-juego');
    render();
}

function render() {
    const item = quiz[current];
    document.getElementById('txt-progreso').innerText = `OBJ: ${current + 1}/${quiz.length}`;
    document.getElementById('txt-puntos').innerText = `EFIC: ${Math.round((points/(current||1))*100)}%`;
    document.getElementById('img-objetivo').src = item.imagen;
    document.getElementById('pista-text').innerText = item.descripcion;
    document.getElementById('btn-next').classList.add('hidden');
    document.getElementById('feedback-txt').innerText = "";

    const box = document.getElementById('grid-opciones');
    box.innerHTML = '';
    
    item.opciones.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'ans-btn';
        b.innerText = opt;
        b.onclick = () => verificar(opt, b);
        box.appendChild(b);
    });
}

function verificar(pick, el) {
    const correct = quiz[current].nombre;
    const btns = document.querySelectorAll('.ans-btn');
    btns.forEach(b => b.disabled = true);

    if(pick === correct) {
        el.classList.add('correct');
        points++;
        document.getElementById('feedback-txt').innerText = "CORRECTO";
    } else {
        el.classList.add('wrong');
        document.getElementById('feedback-txt').innerText = `ES UN ${correct}`;
        btns.forEach(b => { if(b.innerText === correct) b.classList.add('correct'); });
    }
    document.getElementById('btn-next').classList.remove('hidden');
}

function proximoObjetivo() {
    current++;
    if(current < quiz.length) render();
    else {
        alert(`Entrenamiento finalizado. Aciertos: ${points}/${quiz.length}`);
        location.reload();
    }
}
