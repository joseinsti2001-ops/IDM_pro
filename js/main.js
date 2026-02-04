let db = [];           // Base de datos cruda
let sessionPool = [];  // Preguntas filtradas para la partida actual
let currentIndex = 0;  // Pregunta actual
let score = 0;         // Puntuación
let config = { categorias: [], modo: null };

// 1. CARGAR BASE DE DATOS AL INICIAR
fetch('data/vehiculos.json')
    .then(response => response.json())
    .then(data => {
        db = data;
        console.log(`Base de datos cargada: ${db.length} registros.`);
    })
    .catch(err => alert("Error crítico: No se encuentra data/vehiculos.json"));

// 2. INTERACTIVIDAD DEL MENÚ
// Selección de categorías
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        const cat = btn.dataset.cat;
        // Si ya está, lo quita. Si no, lo añade.
        if (config.categorias.includes(cat)) {
            config.categorias = config.categorias.filter(c => c !== cat);
        } else {
            config.categorias.push(cat);
        }
    });
});

// Selección de modo (solo uno a la vez)
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        config.modo = btn.dataset.mode;
    });
});

// Botón de Inicio
document.getElementById('start-btn').addEventListener('click', () => {
    if (config.categorias.length === 0 || !config.modo) {
        alert("⚠️ Configure categorías y modo antes de iniciar.");
        return;
    }
    startGame();
});

// 3. LÓGICA DEL JUEGO
function startGame() {
    // Filtrar la base de datos según categorías elegidas
    sessionPool = db.filter(item => config.categorias.includes(item.tipo));

    if (sessionPool.length === 0) {
        alert("No hay vehículos cargados en esas categorías todavía.");
        return;
    }

    // Mezclar orden de preguntas
    sessionPool.sort(() => Math.random() - 0.5);

    // Ajustes por modo
    if (config.modo === 'examen') {
        sessionPool = sessionPool.slice(0, 20); // Solo 20 preguntas
    }

    // Resetear variables
    currentIndex = 0;
    score = 0;

    // Cambiar pantalla
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    renderQuestion();
}

function renderQuestion() {
    const data = sessionPool[currentIndex];
    const container = document.getElementById('quiz-container');

    // Mezclar las opciones de respuesta
    const shuffledOptions = [...data.opciones].sort(() => Math.random() - 0.5);

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; color:#94a3b8;">
            <span>MODO: ${config.modo.toUpperCase()}</span>
            <span>OBJETIVO ${currentIndex + 1} / ${sessionPool.length}</span>
        </div>

        <img src="${data.imagen}" class="img-quiz" 
             onerror="this.src='https://placehold.co/600x400?text=IMAGEN+NO+ENCONTRADA'">
        
        <div class="desc">"${data.descripcion}"</div>

        <div class="options-grid">
            ${shuffledOptions.map(opt => `
                <button class="opt-btn" onclick="checkAnswer('${opt}', this)">${opt}</button>
            `).join('')}
        </div>
    `;
}

// Función global para verificar respuesta
window.checkAnswer = (selected, btnElement) => {
    const correct = sessionPool[currentIndex].nombre; // Asegúrate que en JSON es "nombre" o "respuesta"
    const allButtons = document.querySelectorAll('.opt-btn');

    // Deshabilitar todos los botones para que no pulsen dos veces
    allButtons.forEach(btn => btn.disabled = true);

    let isCorrect = false;

    if (selected === correct) {
        btnElement.classList.add('correct');
        score++;
        isCorrect = true;
    } else {
        btnElement.classList.add('incorrect');
        // Mostrar cuál era la correcta
        allButtons.forEach(btn => {
            if (btn.innerText === correct) btn.classList.add('correct');
        });
    }

    // Lógica de Modos especiales
    if (config.modo === 'supervivencia' && !isCorrect) {
        setTimeout(() => endGame(false), 1500);
        return;
    }

    // Esperar 1.5 segundos y pasar a la siguiente
    setTimeout(() => {
        currentIndex++;
        if (currentIndex < sessionPool.length) {
            renderQuestion();
        } else {
            endGame(true);
        }
    }, 1500);
};

function endGame(completed) {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    
    const msg = completed ? "MISIÓN COMPLETADA" : "MISIÓN FALLIDA (KIA)";
    document.querySelector('#result-screen h2').innerText = msg;
    document.getElementById('final-score').innerText = `Puntuación: ${score} / ${sessionPool.length}`;
}
