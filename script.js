
// JavaScript variables
let score = 0;
let gameStarted = false;

// Function to place Waldo in a random location
function placeWaldo() {
    const waldo = document.getElementById('waldo');
    const container = document.querySelector('.game-container');
    const maxX = container.clientWidth - waldo.clientWidth;
    const maxY = container.clientHeight - waldo.clientHeight;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    waldo.style.left = randomX + 'px';
    waldo.style.top = randomY + 'px';
}

// Function to update the score
function updateScore() {
    const counter = document.getElementById('counter');
    counter.textContent = `Score: ${score}`;
}

// Event listener for the Start button
const startButton = document.getElementById('start-button');
startButton.addEventListener('click', () => {
    if (!gameStarted) {
        score = 0;
        updateScore();
        gameStarted = true;
    }
    placeWaldo();
});

// Event listener for clicking on Waldo
const waldo = document.getElementById('waldo');
waldo.addEventListener('click', () => {
    if (gameStarted) {
        score++;
        updateScore();
        placeWaldo();
    }
});
