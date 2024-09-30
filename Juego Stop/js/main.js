 // Variables globales
let players = []; // Almacena los jugadores en el juego
let currentPlayer; // Jugador que tiene el turno actual
let threatenedPlayer; // Jugador que ha sido amenazado
let targetPlayer; // Jugador objetivo elegido por el amenazado
let positions = []; // Almacena las posiciones de los jugadores
let scores = {}; // Almacena los puntajes de los jugadores
const maxPoints = 10; // Número de puntos necesarios para ganar el juego
let steps = 0; // Contador de pasos dados por el amenazado
const maxSteps = 3; // Límite de pasos que el amenazado puede dar
let movementKeys = []; // Teclas asignadas a cada jugador para moverse
let stopGame = false; // Indica si el juego debe detenerse cuando el amenazado llega al círculo
let keysPressed = {}; // Almacena el estado de las teclas presionadas

// Inicializar el juego cuando se hace clic en el botón "startGame"
document.getElementById('startGame').addEventListener('click', startGame);

function startGame() {
    // Solicitar el número de jugadores entre 3 y 6
    let numPlayers = prompt('¿Cuántos jugadores? (3-6)');
    numPlayers = parseInt(numPlayers);
    
    // Validar el número de jugadores
    if (numPlayers < 3 || numPlayers > 6) {
        alert('El número de jugadores debe estar entre 3 y 6.');
        return;
    }

    // Asignar teclas de movimiento a los jugadores
    const keys = ['q', 'x', 'r', 'b', 'u', 'p']; 
    let instructions = ''; // Se muestra a los jugadores cuales son sus teclas

    // Asignar países, teclas y puntajes iniciales a cada jugador
    for (let i = 0; i < numPlayers; i++) {
        let country = prompt(`Jugador ${i + 1}, elige tu país:`);
        let key = keys[i];  // Asignar tecla de movimiento en base al índice del jugador
        players.push({ name: country, element: createPlayer(i, country), key: key }); // Crear y agregar el jugador
        scores[country] = 0; // Inicializar puntaje en 0
        movementKeys.push(key); // Guardar la tecla de movimiento

        // Añadir la tecla de movimiento a las instrucciones que se mostrarán
        instructions += `${country} se moverá usando la tecla "${key.toUpperCase()}".\n`;
    }

    // Mostrar las instrucciones de teclas de movimieto a los jugadores
    alert(instructions);

    // Ocultar botón de inicio y mostrar botón para terminar el juego
    document.getElementById('startGame').style.display = 'none';
    document.getElementById('endGame').style.display = 'inline';

    // Colocar los jugadores en posiciones iniciales alrededor del círculo
    positionPlayers();

    // Elegir aleatoriamente quién comienza el juego
    currentPlayer = players[Math.floor(Math.random() * players.length)];
    alert(`${currentPlayer.name} comienza el juego.`);

    // Declarar guerra
    declareWar();
}

// Crear el elemento visual del jugador (div) y asignarle el país
function createPlayer(index, country) {
    const player = document.createElement('div');
    player.classList.add('player'); // Añadir clase para estilos CSS
    player.innerText = country; // Mostrar el nombre del país en el div
    player.style.position = 'absolute'; // Hacer que se pueda mover en la pantalla
    document.getElementById('gameContainer').appendChild(player); // Añadir el jugador al contenedor del juego
    return player; 
}

// Posicionar a los jugadores a los lados del círculo
function positionPlayers() {
    const radius = 200; 
    const centerX = document.getElementById('gameContainer').offsetWidth / 2; // Centro horizontal del contenedor
    const centerY = document.getElementById('gameContainer').offsetHeight / 2; // Centro vertical del contenedor
    const numPlayers = players.length; // Número de jugadores en el juego

    // Dividir jugadores entre izquierda y derecha
    const half = Math.ceil(numPlayers / 2);

    players.forEach((player, index) => {
        let x, y;

        if (index < half) {
            // Jugadores del lado izquierdo
            x = centerX - radius - 50; 
            y = centerY + (index - half / 2) * 100;
        } else {
            // Jugadores del lado derecho
            x = centerX + radius + 50; 
            y = centerY + (index - half) * 100;
        }

        player.element.style.left = `${x}px`;
        player.element.style.top = `${y}px`;
        positions.push({ x, y }); // Guardar la posición
    });
}

// El jugador actual elige a quién amenazar
function declareWar() {
    let enemy = prompt(`${currentPlayer.name}, ¿a quién le declaras la guerra?`); 
    threatenedPlayer = players.find(p => p.name === enemy); // Buscar el jugador amenazado
    
    // Validar que el jugador elegido sea correctto
    if (!threatenedPlayer) {
        alert('Jugador no válido, elige de nuevo.');
        declareWar();
        return;
    }

    alert(`¡${threatenedPlayer.name} ha sido amenazado!`);

    stopGame = false; // Permitir que el juego continúe
    steps = 0; // Restablecer el contador de pasos

    // Iniciar el ciclo de movimiento del juego
    startMovementLoop();

    // Escuchar eventos de teclado para mover jugadores
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

// Actualizar estado de teclas presionadas
function handleKeyDown(event) {
    if (stopGame) return; // No hacer nada si el juego se detuvo
    keysPressed[event.key.toLowerCase()] = true; // Registrar que la tecla se ha presionado
}

// Actualizar estado de teclas al soltar
function handleKeyUp(event) {
    keysPressed[event.key.toLowerCase()] = false; // Registrar que la tecla se soltó
}

// Iniciar el ciclo de movimiento que se ejecuta continuamente en cada frame
function startMovementLoop() {
    function updateMovement() {
        if (stopGame) return; // Detener el ciclo si el juego ha terminado

        players.forEach((player) => {
            // Mover al jugador amenazado hacia el círculo
            if (keysPressed[player.key]) {
                if (player === threatenedPlayer) {
                    moveThreatenedPlayerToCircle();
                } else {
                    // Mover a los otros jugadores 
                    movePlayerToSide(player);
                }
            }
        });

        requestAnimationFrame(updateMovement);
    }

    updateMovement(); // Iniciar el ciclo de movimiento
}

// Mover al jugador amenazado hacia el círculo central
function moveThreatenedPlayerToCircle() {
    const circle = document.getElementById('circle'); // Obtener el círculo del juego
    const circleRect = circle.getBoundingClientRect(); // Obtener coordenadas del círculo
    const playerRect = threatenedPlayer.element.getBoundingClientRect(); // Obtener coordenadas del jugador amenazado

    // Calcular distancia entre el jugador y el círculo
    const distX = circleRect.left - playerRect.left;
    const distY = circleRect.top - playerRect.top;

    // Mover al jugador hacia el círculo
    threatenedPlayer.element.style.left = `${parseInt(threatenedPlayer.element.style.left) + distX / 10}px`;
    threatenedPlayer.element.style.top = `${parseInt(threatenedPlayer.element.style.top) + distY / 10}px`;

    // Verificar si el jugador ha llegado al círculo
    if (Math.abs(distX) <= 10 && Math.abs(distY) <= 10) {
        alert(`${threatenedPlayer.name} ha llegado al círculo!`);

        // Pedir al jugador amenazado que elija una víctima
        chooseTarget();
    }
}

// Elegir a la víctima a alcanzar por parte del jugador amenazado
function chooseTarget() {
    targetPlayer = prompt(`¡${threatenedPlayer.name}, elige tu víctima a alcanzar!`); 
    if (!players.some(p => p.name === targetPlayer)) { // Validar si el jugador es correcto
        alert('Jugador no válido, elige de nuevo.');
        chooseTarget(); 
        return;
    }

    // Reiniciar el contador de pasos
    steps = 0;

    determineWinner();
}

// Elegir aleatoriamente entre el jugador amenazado y su víctima quién gana
function determineWinner() {
    const target = players.find(p => p.name === targetPlayer); // Buscar el jugador víctima

    // Seleccionar aleatoriamente entre el amenazado y la víctima
    const winner = Math.random() < 0.5 ? threatenedPlayer : target;

    // Incrementar el puntaje del ganador
    scores[winner.name] += 1;

    // Mostrar el resultao del enfrentamiento
    alert(`${winner.name} ha ganado el enfrentamiento y suma 1 punto!`);

    // Verificar si el ganador ha alcanzado el máximo de puntos para ganar el juego
    if (checkGameOver()) {
        alert(`${winner.name} ha ganado el juego con ${scores[winner.name]} puntos!`);
        resetGame();
    } else {
        stopPlayers();
        nextTurn(); 
    }
}

// Verificar si algún jugador ha alcanzado la puntuación máxima
function checkGameOver() {
    return Object.values(scores).some(score => score >= maxPoints); // Retorna true si alguien ha ganado
}

// Avanzar al siguiente turno
function nextTurn() {
    const currentIndex = players.indexOf(currentPlayer); // Obtener el índice del jugador actual
    currentPlayer = players[(currentIndex + 1) % players.length]; // Elegir el siguiente jugador en la lista
    alert(`${currentPlayer.name} es el próximo jugador.`);

    declareWar();
}

// Mover a los jugadores que no están amenazados
function movePlayerToSide(player) {
    const container = document.getElementById('gameContainer'); // Contenedor del juego
    const containerRect = container.getBoundingClientRect(); // Coordenadas del contenedor
    const playerRect = player.element.getBoundingClientRect(); // Coordenadas del jugador

    let x = parseInt(player.element.style.left); // Posición X actual del jugador
    let y = parseInt(player.element.style.top); // Posición Y actual del jugador

    if (playerRect.left < containerRect.width / 2) {
        // Si está a la izquierda, moverse más a la izquierda
        if (playerRect.left > containerRect.left) {
            player.element.style.left = `${x - 3}px`; 
        }
    } else {
        // Si está a la derecha, moverse más a la derecha
        if (playerRect.right < containerRect.right) {
            player.element.style.left = `${x + 3}px`; 
        }
    }
}

// Detener a los jugadores al final del turno
function stopPlayers() {
    alert('El jugador amenazado ha terminado su turno.');
    document.removeEventListener('keydown', handleKeyDown); 
    document.removeEventListener('keyup', handleKeyUp);
}

// Reiniciar el juego, limpiando las variables y la interfaz
function resetGame() {
    players = []; 
    currentPlayer = null; 
    threatenedPlayer = null; 
    positions = []; 
    scores = {}; 
    stopGame = false; // Reiniciar estado del juego
    document.getElementById('startGame').style.display = 'inline'; 
    document.getElementById('endGame').style.display = 'none';
}
