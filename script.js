
// JavaScript variables
let score = 0;
let gameStarted = false;

// Function to place Waldo in a random location
function placeWaldo() {
    const waldo = document.getElementById('waldo');
    const container = document.querySelector('.game-container');
    const maxX = container.offsetWidth - waldo.offsetWidth;
    const maxY = container.offsetHeight - waldo.offsetHeight;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    console.log(randomX)
    console.log(randomY)

    waldo.style.left = randomX + 'px';
    waldo.style.top = randomY + 'px';
}

// Function to update the score
function updateScore() {
    const counter = document.getElementById('counter');
    counter.textContent = `Score: ${score}`;
}

const startButton = document.getElementById('start-button');
startButton.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;

        // Show Waldo when the game starts
        const waldo = document.getElementById('waldo');
        waldo.style.display = 'block';
    }
    score = 0;
    updateScore();
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
