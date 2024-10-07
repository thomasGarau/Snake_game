const canvas = document.getElementById('monCanvas');
const ctx = canvas.getContext('2d');
const btnRun = document.getElementById('run');
const btnStop = document.getElementById('stop');
const btnPas = document.getElementById('pas_a_pas');
const btnRaz = document.getElementById('raz');
const selectVitesse = document.getElementById('vitesse');
const compteur = document.getElementById('compteur');
const circle = document.querySelector('.circle');

let width = canvas.width * 0.05;
let height = canvas.height * 0.05;
let startY = canvas.height / 2;
let posX = 0;
let drawInterval = null;
let vitesse = parseInt(selectVitesse.value);
let isMouseOnCircle = false;
let mouseX = 0;
let mouseY = 0;
let snakeSegments = [];
let lastDirection = null;
let snakeWidth = 3;

btnRun.addEventListener('click', () => {
    clearInterval(drawInterval);
    drawInterval = setInterval(() => {
        draw(vitesse);
    }, 40);
});

btnPas.addEventListener('click', () => {
    clearInterval(drawInterval);
    draw((vitesse * 5));
});

btnStop.addEventListener('click', () => {
    clearInterval(drawInterval);
});

btnRaz.addEventListener('click', () => {
    resetGame();
});

selectVitesse.addEventListener('change', () => {
    vitesse = parseInt(selectVitesse.value);
});

circle.addEventListener('mousemove', (e) => {
    const rect = circle.getBoundingClientRect();
    const x = e.clientX - rect.left - circle.offsetWidth / 2;
    const y = e.clientY - rect.top - circle.offsetHeight / 2;

    const distanceFromCenter = Math.sqrt(x * x + y * y);
    isMouseOnCircle = distanceFromCenter <= circle.offsetWidth / 2;

    if (isMouseOnCircle) {
        mouseX = x;
        mouseY = y;
    }
});

circle.addEventListener('mouseleave', () => {
    isMouseOnCircle = false;
});

function getAngle(x, y) {
    return Math.atan2(y, x);
}

function checkCanvaLimit(){
    let hitLimit = false;

    if (posX + width > canvas.width) {
        posX = canvas.width - width;
        hitLimit = true;
    }
    if (posX < 0) {
        posX = 0;
        hitLimit = true;
    }
    if (startY - height < 0) {
        startY = height;
        hitLimit = true;
    }
    if (startY + height > canvas.height) {
        startY = canvas.height - height;
        hitLimit = true;
    }

    return hitLimit;
}

function updateSnakeSegments() {
    let currentAngle = getAngle(mouseX, mouseY);
    if (currentAngle !== lastDirection) {
        snakeSegments.push({ posX, startY, direction: currentAngle, length: 0 });
        lastDirection = currentAngle;
    }
    let currentSegment = snakeSegments[snakeSegments.length - 1];
    currentSegment.length += vitesse;
    posX += Math.cos(currentAngle) * vitesse;
    startY += Math.sin(currentAngle) * vitesse;
}

function drawSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = snakeWidth;

    for (let segment of snakeSegments) {
        let endX = segment.posX + Math.cos(segment.direction) * segment.length;
        let endY = segment.startY + Math.sin(segment.direction) * segment.length;
        ctx.moveTo(segment.posX, segment.posY);
        ctx.lineTo(endX, endY);
    }

    ctx.stroke();
}

function snakeEatItself() {
    for (let i = 0; i < snakeSegments.length - 1; i++) {
        //determine la droite du segment
        let segment = snakeSegments[i];
        let segmentEndX = segment.posX + Math.cos(segment.direction) * segment.length;
        let segmentEndY = segment.startY + Math.sin(segment.direction) * segment.length;

        if (isPointOnSegment(segment.posX, segment.startY, segmentEndX, segmentEndY, posX, startY)) {
            return true;
        }
    }
    return false;
}

function isPointOnSegment(x1, y1, x2, y2, px, py) {
    //D1 et D2 corresponde à la distance entre la tete du serpent et les deux points terminaux du segment
    const d1 = distance(px, py, x1, y1);
    const d2 = distance(px, py, x2, y2);
    //lineLen la longueur entre les deux points
    const lineLen = distance(x1, y1, x2, y2);
    //buffer pour les calculs de flottant
    const buffer = 0.1; 

    return (d1 + d2 >= lineLen - buffer) && (d1 + d2 <= lineLen + buffer);
}

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function draw(step) {
    ctx.fillStyle = 'red';

    //si le curseur de l'utilisateur est dans le cercle
    if (isMouseOnCircle) {

        //verifie que le serpent ne sort pas du canvas
        if(checkCanvaLimit() || snakeEatItself()){
            //si c'est le cas on supprime l'animation
            resetGame();
            alert('Game Over score total = ' + compteur.innerHTML);
        }else{
            // mets à jours l'animation
            updateSnakeSegments(step);
            drawSnake();

            //augmente le compteur de la taille du serpent
            compteur.innerHTML = (parseInt(compteur.innerHTML) + step);
        }
    }
}

//remet le jeux dans sont état initial
function resetGame(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearInterval(drawInterval)
    snakeSegments = [];
    lastDirection = null;
    width = canvas.width * 0.05;
    height = canvas.height * 0.05;
    startY = canvas.height / 2;
    posX = 0;
    drawInterval = null;
    compteur.innerHTML = 0;
}


