// Variables to control game state
const bucket = document.getElementById("bucket");
let bucketX = 350;
const bucketSpeed = 8;
let movingLeft = false;
let movingRight = false;
let score = 0;
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timeLeft =30;
let collisionInterval;
const mainMenu = document.getElementById("main-menu");
const objectiveScreen = document.getElementById("objective-screen");
const countdownScreen = document.getElementById("countdown-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const winScreen = document.getElementById("win-screen");

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("objective-btn").addEventListener("click", showObjectives);
document.getElementById("back-btn").addEventListener("click", backToMenu);
document.getElementById("retry-btn").addEventListener("click", restartGame);
document.getElementById("play-again-btn").addEventListener("click", restartGame);
document.getElementById("menu-btn").addEventListener("click", backToMenu);
document.getElementById("win-menu-btn").addEventListener("click", backToMenu);
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") movingLeft = true;
    if (e.key === "ArrowRight") movingRight = true;
});
document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") movingLeft = false;
    if (e.key === "ArrowRight") movingRight = false;
});

//Bucket Function


// Screen Functions 
function hideAllScreens() {
    document
      .querySelectorAll(".screen")
      .forEach(screen => {
          screen.classList.remove("active");
      });
}
function showObjectives() {
    hideAllScreens();
    objectiveScreen.classList.add("active");
}
//back to menu
function backToMenu(){
    gameRunning = false;
    clearInterval(dropMaker);
    clearInterval(collisionInterval);
    score = 0;
    timeLeft = 30;
    bucketX = 350;
    document.getElementById("score").textContent = 0;
    document.getElementById("time").textContent = 30;
    document.getElementById("goal").textContent = "0%";
    document.querySelectorAll(".water-drop")
    .forEach(drop => drop.remove());
    hideAllScreens();
    mainMenu.classList.add("active");
}

function startGame() {
    if(gameRunning) return;
    hideAllScreens();
    countdownScreen.classList.add("active")
    let count = 3;
    document.getElementById("countdown-number").textContent = count;
    const countdown = setInterval(() => {
        count--;
        if (count > 0) {
            document.getElementById(
                "countdown-number"
            ).textContent = count;
        } else {
            clearInterval(countdown);
            document.getElementById(
                "countdown-number"
            ).textContent = "GO!";

            setTimeout(() => {
                hideAllScreens();
                gameScreen.classList.add("active");
                beginActualGame();
            }, 1000);
        }
    }, 1000);
}
//Begin Game
function beginActualGame() {
    gameRunning = true;
    dropMaker = setInterval(createDrop,1000)
    collisionInterval = setInterval(checkCollisions, 20);
    const timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent =
      timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame();
    }
}, 1000);
}
//Collision Detection
function checkCollisions() {
    const drops =
      document.querySelectorAll(".water-drop");
    const bucketRect =
      bucket.getBoundingClientRect();
    drops.forEach(drop => {
        const dropRect =
          drop.getBoundingClientRect();
        const collision =
            dropRect.bottom >=
            bucketRect.top &&

            dropRect.left <
            bucketRect.right &&

            dropRect.right >
            bucketRect.left;

        if (collision) {
            const points =
              Number(drop.dataset.points);
            score += points;
            document.getElementById("score").textContent = score;
            drop.remove();
            if (score >= 75) { 
              winGame();
            }
        }
        const percent = Math.min(100, Math.round(score/70*100));
        document.getElementById("goal").textContent = percent + "%";
    });
}
//Win screen function 
function winGame() {
    gameRunning = false;
    clearInterval(dropMaker);
    clearInterval(collisionInterval);
    hideAllScreens();
    winScreen.classList.add("active");
    document.getElementById("win-score").textContent = "Final Score: " + score;
}

//Swipe Support
let touchStartX = 0;
document.addEventListener("touchstart", e => {
    touchStartX =
      e.touches[0].clientX;
});

document.addEventListener("touchmove", e => {
    const touchX =
      e.touches[0].clientX;
    const diff =
      touchX - touchStartX;
    bucketX += diff;
    const container =
      document.getElementById("game-container");
    const maxX =
      container.offsetWidth - 90;
    bucketX = Math.max(
        0,
        Math.min(bucketX, maxX)
    );

    bucket.style.left =
      bucketX + "px";
    touchStartX = touchX;
});

//Water Drop Function
function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";
  const polluted = Math.random() < 0.25;
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;

  drop.style.width = `${size}px`;
  drop.style.height = `${size}px`;

  if (polluted) {
    drop.classList.add("polluted-drop");
    drop.dataset.points = -Math.round(size / 10);
  } else {
    drop.dataset.points = Math.round(size / 10);
  }

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = (Math.random()*2+3)+"s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

//End Game
function endGame() {
    gameRunning = false;
    clearInterval(dropMaker);
    clearInterval(collisionInterval);
    hideAllScreens();
    gameOverScreen.classList.add("active");
    document.getElementById(
        "final-score"
    ).textContent =
      "Final Score: " +
      document.getElementById("score").textContent;
}

function updateBucket(){
    const gameContainer = document.getElementById("game-container");
    const maxX = gameContainer.offsetWidth - bucket.offsetWidth;
    if(movingLeft){
        bucketX -= bucketSpeed;
    }
    if(movingRight){
        bucketX += bucketSpeed;
    }
    bucketX = Math.max(0, Math.min(bucketX,maxX));
    bucket.style.left = bucketX + "px";
    requestAnimationFrame(updateBucket);
}
updateBucket();

const gameContainer = document.getElementById("game-container");
gameContainer.addEventListener("mousemove", e=>{
    const rect = gameContainer.getBoundingClientRect();
    bucketX = e.clientX - rect.left - bucket.offsetWidth/2;
    const maxX = gameContainer.offsetWidth - bucket.offsetWidth;
    bucketX = Math.max(0, Math.min(bucketX,maxX));
    bucket.style.left = bucketX + "px";
});

//Start Game
function restartGame(){
    score = 0;
    timeLeft = 30;
    bucketX = 350;
    document.getElementById("score").textContent = score;
    document.getElementById("time").textContent = timeLeft;
    bucket.style.left = bucketX + "px";
    document.querySelectorAll(".water-drop").forEach(drop=>drop.remove());
    startGame();
}