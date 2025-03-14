// Game logic: randomly choose the correct answer (Ulya or Fisa)
let correctAnswer = Math.random() < 0.5 ? 'Ulya' : 'Fisa';

// Global variables to store images list, score, and last used indices
let imagesData = null;
let lastUlyaIndex = -1;
let lastFisaIndex = -1;
let score = 0; // start with 0 points
let attempts = 0; // start with 0 attempts

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
    let folder, imagesArray, lastIndex;
    
    if (correctAnswer === 'Ulya') {
        folder = "./ulya/";
        imagesArray = imagesData.ulya;
        lastIndex = lastUlyaIndex;
    } else {
        folder = "./fisa/";
        imagesArray = imagesData.fisa;
        lastIndex = lastFisaIndex;
    }
    
    if (imagesArray.length === 0) return; // no images available

    // Pick a random image index, avoid repeating the immediate last index
    let randomIndex = Math.floor(Math.random() * imagesArray.length);
    if (imagesArray.length > 1) {
        while (randomIndex === lastIndex) {
            randomIndex = Math.floor(Math.random() * imagesArray.length);
        }
    }
    
    // Update the last used index for whichever folder we used
    if (correctAnswer === 'Ulya') {
        lastUlyaIndex = randomIndex;
    } else {
        lastFisaIndex = randomIndex;
    }

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
    if (imagesData) {
        setPicture();
    }
}

// p5.js background animation
function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    let blueShade = map(sin(frameCount * 0.01), -1, 1, 200, 255);
    background(20, 40, blueShade);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function startGame() {
  document.getElementById('welcome-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
}
