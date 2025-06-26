// JavaScript variables
let score = 0;
let gameStarted = false;
let gameOver = false;
let startTime = 0; // For overall game stopwatch
let currentWaldoAppearanceTime = 0; // For time taken to find current Waldo
let totalTime = 0; // For overall game duration calculation
let stopwatchInterval;
let clickTimes = 0; // For overall average time per click
let waldoClickRecords = []; // New: To store {x, y, timeTaken} for each click

const infoSign = document.getElementById('info-sign');
const infoPopup = document.getElementById('info-popup');
const closeInfoPopup = document.getElementById('close-info-popup');
const mask = document.getElementById('mask');
const svg = document.getElementById('svg');
const toggleSwitch = document.getElementById('toggle-switch');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const waldo = document.getElementById('waldo'); // Get Waldo element once
const gameContainer = document.querySelector('.game-container'); // Get game container once

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
    const maxX = gameContainer.offsetWidth - waldo.offsetWidth;
    const maxY = gameContainer.offsetHeight - waldo.offsetHeight;

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
        gameOver = false; // Ensure game is not in game over state
        startTime = new Date().getTime(); // For overall stopwatch
        currentWaldoAppearanceTime = new Date().getTime(); // For first Waldo find time
        stopwatchInterval = setInterval(updateStopwatch, 1000);

        // Show Waldo when the game starts
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
        // Reset the stopwatch and score on subsequent clicks (restarts)
        clearInterval(stopwatchInterval);
        startTime = new Date().getTime(); // Reset overall stopwatch
        currentWaldoAppearanceTime = new Date().getTime(); // Reset for first Waldo of new game
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
    waldoClickRecords = []; // New: Clear records for a new game
    updateScore();
    placeWaldo();
});

// Event listener for clicking on Waldo
waldo.addEventListener('click', () => {
    if (gameStarted) {
        score++;
        updateScore();
        
        // New: Record Waldo's position and time taken
        const timeTaken = new Date().getTime() - currentWaldoAppearanceTime;
        const waldoX = parseInt(waldo.style.left);
        const waldoY = parseInt(waldo.style.top);
        waldoClickRecords.push({ x: waldoX, y: waldoY, time: timeTaken });
        
        clickTimes++; // For overall average calculation
        
        updateStopwatch(); // Update overall stopwatch
        placeWaldo(); // Move Waldo to a new location
        currentWaldoAppearanceTime = new Date().getTime(); // Reset timer for next Waldo find
    }
});

// Stop button event handler
stopButton.addEventListener('click', () => {
    if (gameStarted && !gameOver) {
        gameStarted = false;
        gameOver = true;
        clearInterval(stopwatchInterval);

        // Hide Waldo, update button display
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
        const gameOverMessage = document.createElement('div');
        gameOverMessage.className = 'game-over-message';
        gameOverMessage.innerHTML = `
            <h1>Game Over</h1>
            <p>Final Score: ${score}</p>
            <p>Total Time: ${(totalTime / 1000).toFixed(2)} seconds</p>
            <p>${averageTime.toFixed(2)} seconds per click</p>
            <button id="exportHeatmapButton" class="btn">Export Field of Vision</button>
        `;
        gameContainer.appendChild(gameOverMessage);

        // New: Add event listener to the dynamically created export button
        const exportHeatmapButton = document.getElementById('exportHeatmapButton');
        if (exportHeatmapButton) {
            exportHeatmapButton.addEventListener('click', generateAndExportHeatmap);
        }
    }
});

// New function to generate and export heatmap data
function generateAndExportHeatmap() {
    if (waldoClickRecords.length === 0) {
        alert("No Waldo finds recorded to generate a heatmap for this game session.");
        return;
    }

    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;

    // Initialize heatmap and counts matrices with zeros
    // Using Array.from for deep copy of inner arrays to avoid shared references
    const heatmapSum = Array.from({ length: containerHeight }, () => Array(containerWidth).fill(0));
    const heatmapCounts = Array.from({ length: containerHeight }, () => Array(containerWidth).fill(0));

    // Aggregate data
    waldoClickRecords.forEach(record => {
        const { x, y, time } = record;
        // Ensure coordinates are within bounds of the container
        // Note: Waldo's position (x,y) is its top-left corner.
        // For a heatmap, we might consider a small area around it,
        // but for simplicity, we'll just use the top-left pixel.
        if (y >= 0 && y < containerHeight && x >= 0 && x < containerWidth) {
            heatmapSum[y][x] += time;
            heatmapCounts[y][x] += 1;
        }
    });

    // Calculate average time for each recorded pixel
    const finalHeatmap = Array.from({ length: containerHeight }, () => Array(containerWidth).fill(0));
    for (let r = 0; r < containerHeight; r++) {
        for (let c = 0; c < containerWidth; c++) {
            if (heatmapCounts[r][c] > 0) {
                finalHeatmap[r][c] = heatmapSum[r][c] / heatmapCounts[r][c]; // Average time in milliseconds
            }
        }
    }

    // Convert heatmap to JSON string for export
    const heatmapJson = JSON.stringify(finalHeatmap, null, 2); // Pretty print JSON for readability

    // Create a Blob and trigger download
    const blob = new Blob([heatmapJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'waldo_field_of_vision_heatmap.json'; // Suggested filename
    document.body.appendChild(a); // Append to body to make it clickable
    a.click(); // Programmatically click the link to trigger download
    document.body.removeChild(a); // Clean up the element
    URL.revokeObjectURL(url); // Release the object URL
}
