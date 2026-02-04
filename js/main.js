let db = [];           // Base de datos cruda
let sessionPool = [];  // Preguntas filtradas
let currentIndex = 0;  
let score = 0;         // Aciertos
let fallos = 0;        // Fallos
let config = { categorias: [], modo: null };

// 1. CARGAR DATOS
fetch('data/vehiculos.json')
    .then(response => response.json())
    .then(data => {
        db = data;
        console.log(`Base de datos lista.`);
    })
    .catch(err => alert("Error al cargar JSON"));

// 2. CONFIGURACIÓN DEL MENÚ
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        const cat = btn.dataset.cat;
        if (config.categorias.includes(cat)) {
            config.categorias = config.categorias.filter(c => c !== cat);
        } else {
            config.categorias.push(cat);
        }
    });
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        config.modo = btn.dataset.mode;
    });
});

document.getElementById('start-btn').addEventListener('click', () => {
    if (config.categorias.length === 0 || !config.modo) {
        alert("⚠️ Selecciona categorías y modo.");
        return;
    }
    startGame();
});

// 3. LÓGICA DE JUEGO
function startGame() {
    sessionPool = db.filter(item => config.categorias.includes(item.tipo));
    if (sessionPool.length === 0) {
        alert("No hay datos en esta categoría.");
        return;
    }

    sessionPool.sort(() => Math.random() - 0.5);
    if (config.modo === 'examen') sessionPool = sessionPool.slice(0, 20);

    currentIndex = 0;
    score = 0;
    fallos = 0;

    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    renderQuestion();
}

function renderQuestion() {
    const data = sessionPool[currentIndex];
    const container = document.getElementById('quiz-container');
    const shuffledOptions = [...data.opciones].sort(() => Math.random() - 0.5);

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; color:#94a3b8; font-size:0.8rem;">
            <span>OBJETIVO: ${currentIndex + 1} / ${sessionPool.length}</span>
            <span>MODO: ${config.modo.toUpperCase()}</span>
        </div>

        <img src="${data.imagen}" class="img-quiz" onerror="this.src='https://placehold.co/600x400?text=IMAGEN+NO+ENCONTRADA'">
        
        <div class="desc">"${data.descripcion}"</div>

        <div class="options-grid">
            ${shuffledOptions.map(opt => `
                <button class="opt-btn" onclick="checkAnswer('${opt}', this)">${opt}</button>
            `).join('')}
        </div>
    `;
}

window.checkAnswer = (selected, btnElement) => {
    const correct = sessionPool[currentIndex].nombre;
    const allButtons = document.querySelectorAll('.opt-btn');
    allButtons.forEach(btn => btn.disabled = true);

    let esCorrecto = (selected === correct);

    if (esCorrecto) {
        btnElement.classList.add('correct');
        score++;
        if (document.getElementById('puntos-si')) document.getElementById('puntos-si').innerText = score;
        if (navigator.vibrate) navigator.vibrate(50);
    } else {
        btnElement.classList.add('incorrect');
        fallos++;
        if (document.getElementById('puntos-no')) document.getElementById('puntos-no').innerText = fallos;
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        allButtons.forEach(btn => {
            if (btn.innerText === correct) btn.classList.add('correct');
        });
    }

    // Manejo de tiempos y fin de juego
    setTimeout(() => {
        // Si fallas en Supervivencia, fin inmediato
        if (config.modo === 'supervivencia' && !esCorrecto) {
            endGame(false);
            return;
        }

        currentIndex++;
        if (currentIndex < sessionPool.length) {
            renderQuestion();
        } else {
            endGame(true);
        }
    }, 1200);
};

function endGame(completed) {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    
    const msg = completed ? "MISIÓN COMPLETADA" : "MISIÓN FALLIDA (KIA)";
    document.querySelector('#result-screen h2').innerText = msg;
    document.getElementById('final-score').innerText = `Aciertos: ${score} | Fallos: ${fallos}`;
}
