
// JavaScript variables
let score = 0;
let gameStarted = false;
let gameOver = false;
let startTime = 0;
let totalTime = 0;
let stopwatchInterval;
let clickTimes = 0;
const infoSign = document.getElementById('info-sign');
const infoPopup = document.getElementById('info-popup');
const closeInfoPopup = document.getElementById('close-info-popup');
const mask = document.getElementById('mask');
const svg = document.getElementById('svg');
const toggleSwitch = document.getElementById('toggle-switch');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');

// Toggle tunnel vision effect
toggleSwitch.addEventListener('change', function() {
  if (this.checked) {
    svg.style.display = 'block';
  } else {
    svg.style.display = 'none';
  }
});

// Update mask position based on mouse movement
document.addEventListener("mousemove", (event) => {
    var point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(svg.getScreenCTM().inverse());
    mask.setAttribute('cx', point.x);
    mask.setAttribute('cy', point.y);
});

// Info popup handlers
infoSign.addEventListener('click', () => {
    infoPopup.style.display = 'block';
});

closeInfoPopup.addEventListener('click', () => {
    infoPopup.style.display = 'none';
});

// Function to place Waldo in a random location
function placeWaldo() {
    const waldo = document.getElementById('waldo');
    const container = document.querySelector('.game-container');
    const maxX = container.offsetWidth - waldo.offsetWidth;
    const maxY = container.offsetHeight - waldo.offsetHeight;

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

// Function to update the stopwatch
function updateStopwatch() {
    const stopwatch = document.getElementById('stopwatch');
    const currentTime = new Date().getTime();
    const elapsedMilliseconds = currentTime - startTime;
    const seconds = Math.floor(elapsedMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    stopwatch.textContent = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Function to toggle between start and stop buttons
function toggleGameControls(isGameRunning) {
    if (isGameRunning) {
        startButton.style.display = 'none';
        stopButton.style.display = 'flex';
    } else {
        startButton.style.display = 'flex';
        stopButton.style.display = 'none';
    }
}

// Start button event handler
startButton.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        startTime = new Date().getTime();
        stopwatchInterval = setInterval(updateStopwatch, 1000);

        // Show Waldo when the game starts
        const waldo = document.getElementById('waldo');
        waldo.style.display = 'block';
        
        // Make sure that the stopwatch and counter are visible
        const counter = document.getElementById('counter');
        counter.style.display = 'flex';
        const stopwatch = document.getElementById('stopwatch');
        stopwatch.style.display = 'flex';
        
        // Toggle button display
        toggleGameControls(true);
    }
    else {
        // Reset the stopwatch and score on subsequent clicks
        clearInterval(stopwatchInterval);
        startTime = new Date().getTime();
        updateStopwatch();
    }
    
    if (gameOver) {
        gameOver = false;
        // Remove the game over message if it exists
        const gameOverMessage = document.querySelector('.game-over-message');
        if (gameOverMessage) {
            gameOverMessage.remove();
        }
    }
    
    score = 0;
    totalTime = 0;
    clickTimes = 0;
    updateScore();
    placeWaldo();
});

// Event listener for clicking on Waldo
const waldo = document.getElementById('waldo');
waldo.addEventListener('click', () => {
    if (gameStarted) {
        score++;
        updateScore();
        
        if (startTime > 0) {
            clickTimes++;
        }
        
        updateStopwatch();
        placeWaldo();
    }
});

// Stop button event handler
stopButton.addEventListener('click', () => {
    if (gameStarted && !gameOver) {
        gameStarted = false;
        gameOver = true;
        clearInterval(stopwatchInterval);

        // Hide Waldo, update button display
        const waldo = document.getElementById('waldo');
        waldo.style.display = 'none';
        toggleGameControls(false);
        
        // Hide stats during game over screen
        const counter = document.getElementById('counter');
        counter.style.display = 'none';
        const stopwatch = document.getElementById('stopwatch');
        stopwatch.style.display = 'none';
    
        // Calculate total elapsed time
        totalTime += new Date().getTime() - startTime;

        // Calculate average time between clicks
        const averageTime = clickTimes > 0 ? totalTime / clickTimes / 1000 : 0;

        // Display the final results
        const gameContainer = document.querySelector('.game-container');
        const gameOverMessage = document.createElement('div');
        gameOverMessage.className = 'game-over-message';
        gameOverMessage.innerHTML = `
            <h1>Game Over</h1>
            <p>Final Score: ${score}</p>
            <p>Total Time: ${(totalTime / 1000).toFixed(2)} seconds</p>
            <p>${averageTime.toFixed(2)} seconds per click</p>
        `;
        gameContainer.appendChild(gameOverMessage);
    }
});

