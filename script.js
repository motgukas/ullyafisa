// Game logic: randomly choose the correct answer (Ulya or Fisa)
let correctAnswer = Math.random() < 0.5 ? 'Ulya' : 'Fisa';

// Global variables to store images list, score, and last used indices
let imagesData = null;
let usedUlyaIndices = [];
let usedFisaIndices = [];
let score = 0; // start with 0 points
let attempts = 0; // start with 0 attempts

// New global variables for particle explosion
let gameOver = false;
let particles = [];

// Load image filenames from images.json and set the initial picture
fetch('./images.json')
  .then(response => response.json())
  .then(data => {
      imagesData = data;
      setPicture(); // Set initial image
  })
  .catch(error => console.error("Error loading images.json:", error));

// Set the image source to a random image from the appropriate folder
// ensuring it's different from the previous one
function setPicture() {
    if (!imagesData) return; // Ensure imagesData is loaded
    const img = document.getElementById('person-image');
    let folder, imagesArray, usedIndices;
    
    if (correctAnswer === 'Ulya') {
        folder = "./ulya/";
        imagesArray = imagesData.ulya;
        usedIndices = usedUlyaIndices;
    } else {
        folder = "./fisa/";
        imagesArray = imagesData.fisa;
        usedIndices = usedFisaIndices;
    }
    
    if (imagesArray.length === 0) return; // no images available

    // Build list of indices that haven't been used yet.
    let availableIndices = [];
    for (let i = 0; i < imagesArray.length; i++) {
        if (!usedIndices.includes(i)) {
            availableIndices.push(i);
        }
    }
    
    // Reset if all images were already shown.
    if (availableIndices.length === 0) {
        usedIndices.length = 0; // clears the array
        for (let i = 0; i < imagesArray.length; i++) {
            availableIndices.push(i);
        }
    }
    
    // Pick a random image from available ones and store its index.
    let randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    usedIndices.push(randomIndex);
    
    // Set the image src
    img.src = folder + imagesArray[randomIndex];
}

// Handle guesses, update score (reset to 0 on a wrong guess), then start a new round with a new correct answer
function guessAnswer(answer, elem) {
    const resultEl = document.getElementById('result');
    const scoreSpan = document.getElementById('score');
    const attemptsSpan = document.getElementById('attempts');
    
    attempts++;
    attemptsSpan.textContent = attempts;
    
    if (answer === correctAnswer) {
        score++;
        scoreSpan.textContent = score;
        if (elem) {
            const originalBG = elem.style.backgroundColor;
            elem.style.backgroundColor = "green";
            if (attempts >= 15) {
                setTimeout(() => { endGame(); }, 1000);
                return;
            }
            setTimeout(() => {
                elem.style.backgroundColor = originalBG;
                nextRound();
            }, 1000);
            return;
        }
    } else {
        if (elem) {
            const originalBG = elem.style.backgroundColor;
            elem.style.backgroundColor = "red";
            setTimeout(() => {
                elem.style.backgroundColor = originalBG;
                if (attempts >= 15) {
                    endGame();
                } else {
                    nextRound();
                }
            }, 1000);
            return;
        }
        scoreSpan.textContent = score;
    }
    
    if (attempts >= 15) {
        endGame();
        return;
    }
    
    nextRound();
}

function nextRound() {
    // Start new round
    correctAnswer = Math.random() < 0.5 ? 'Ulya' : 'Fisa';
    if (imagesData) {
        setPicture();
    }
}

function endGame(){
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('ending-container').style.display = 'block';
    document.getElementById('final-score').textContent = score;
    
    // Trigger particle explosion effect only if the user got 15 points
    if (score === 15) {
        gameOver = true;
        // Generate 500 particles (5× more than before) from the center of the canvas
        for (let i = 0; i < 500; i++) {
            particles.push(new Particle(width / 2, height / 2));
        }
    }
}

function resetGame() {
    // Reset score, attempts and UI for a new game
    score = 0;
    attempts = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('attempts').textContent = attempts;
    document.getElementById('result').textContent = "";
    document.getElementById('ending-container').style.display = 'none';
    
    // Remove any inline background color from guess boxes and buttons
    document.querySelectorAll('.guess-box, #play-btn, #play-again-btn').forEach(btn => {
         btn.style.backgroundColor = "";
    });
    
    document.getElementById('game-container').style.display = 'block';
    correctAnswer = Math.random() < 0.5 ? 'Ulya' : 'Fisa';
    usedUlyaIndices = [];
    usedFisaIndices = [];
    if (imagesData) {
        setPicture();
    }
    
    // Reset particle explosion effect
    gameOver = false;
    particles = [];
}

// p5.js background animation
function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    let blueShade = map(sin(frameCount * 0.01), -1, 1, 200, 255);
    background(20, 40, blueShade);
    
    // When game is over, update and render particles
    if (gameOver) {
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.update();
            p.display();
            if (p.isDead()) { particles.splice(i, 1); }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function startGame() {
  document.getElementById('welcome-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
}

// Particle class for explosion effect
class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D();
        this.vel.mult(random(2, 5));
        this.lifetime = 255;
    }
    update() {
        this.pos.add(this.vel);
        this.lifetime -= 4;
    }
    display() {
        noStroke();
        fill(255, this.lifetime);
        ellipse(this.pos.x, this.pos.y, 8);
    }
    isDead() {
        return this.lifetime < 0;
    }
}
