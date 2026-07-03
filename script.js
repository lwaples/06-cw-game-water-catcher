// Variables to control game state
const bucket = document.getElementById("bucket");
let bucketX = 350;
const bucketSpeed = 8;
let movingLeft = false;
let movingRight = false;
let score = 0;
const milestones = [
    {score: 20, message: "Great Start!"},
    {score: 40, message: "Keep Going!"},
    {score: 60, message: "Almost There!"}
];
let shownMilestones = [];
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timeLeft =30;
let difficulty = "easy";
let winScore = 70;
let pollutedChance = 0.25;
let dropSpeedMin = 3;
let dropSpeedMax = 5;
let loseScore = -999;
let dropSpawnRate = 1000;
let collisionInterval;
let timerInterval;
const mainMenu = document.getElementById("main-menu");
const objectiveScreen = document.getElementById("objective-screen");
const countdownScreen = document.getElementById("countdown-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const winScreen = document.getElementById("win-screen");

// =============================
// Update all score displays
// =============================
function updateScore() {
    document.getElementById("score").textContent = score;
    document.getElementById("win-score").textContent = "Final Score: " + score;
    document.getElementById("final-score").textContent = "Final Score: " + score;

    const percent = Math.min(100, Math.round(score / winScore * 100));
    document.getElementById("goal").textContent = percent + "%";
    document.getElementById("progress-fill").style.width = percent + "%";
}

// Wait for button click to start the game
document.getElementById("easy-btn").addEventListener("click",()=>setDifficulty("easy"));
document.getElementById("normal-btn").addEventListener("click",()=>setDifficulty("normal"));
document.getElementById("hard-btn").addEventListener("click",()=>setDifficulty("hard"));
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
    clearInterval(timerInterval);
    score = 0;
    shownMilestones = [];
    document.getElementById("milestone-message").textContent = "";
    timeLeft =
    difficulty==="easy"
    ?30
    :difficulty==="normal"
    ?28
    :25;
    bucketX = 350;
    bucket.style.left = bucketX + "px";
    document.getElementById("time").textContent = timeLeft;
    updateScore();
    document.getElementById("progress-fill").style.width = "0%";
    document.querySelectorAll(".water-drop")
    .forEach(drop => drop.remove());
    hideAllScreens();
    mainMenu.classList.add("active");
}

//difficulty level
function setDifficulty(level){
    difficulty = level;
    document.querySelectorAll(".difficulty-btn").forEach(btn=>btn.classList.remove("active-difficulty"));

    if(level==="easy"){
        winScore = 70;
        timeLeft = 30;
        pollutedChance = 0.25;
        dropSpeedMin = 3;
        dropSpeedMax = 5;
        dropSpawnRate = 1000;
        loseScore = -999;
        document.getElementById("easy-btn").classList.add("active-difficulty");
        document.getElementById("difficulty-title").textContent="Easy";
        document.getElementById("info-time").textContent="30";
        document.getElementById("info-goal").textContent="70";
        document.getElementById("info-pollution").textContent="25";
        document.getElementById("info-lose").textContent="No";
    }
    else if(level==="normal"){
        winScore = 80;
        timeLeft = 28;
        pollutedChance = 0.30;
        dropSpeedMin = 2.8;
        dropSpeedMax = 4.2;
        dropSpawnRate = 850;
        loseScore = -20;
        document.getElementById("normal-btn").classList.add("active-difficulty");
        document.getElementById("difficulty-title").textContent="Normal";
        document.getElementById("info-time").textContent="28";
        document.getElementById("info-goal").textContent="80";
        document.getElementById("info-pollution").textContent="30";
        document.getElementById("info-lose").textContent="Yes";
    }
    else{
        winScore = 90;
        timeLeft = 25;
        pollutedChance = 0.40;
        dropSpeedMin = 2.2;
        dropSpeedMax = 3.4;
        dropSpawnRate = 700;
        loseScore = -20;
        document.getElementById("hard-btn").classList.add("active-difficulty");
        document.getElementById("difficulty-title").textContent="Hard";
        document.getElementById("info-time").textContent="25";
        document.getElementById("info-goal").textContent="90";
        document.getElementById("info-pollution").textContent="40";
        document.getElementById("info-lose").textContent="Yes";
    }
    document.getElementById("time").textContent = timeLeft;
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
    clearInterval(dropMaker);
    clearInterval(collisionInterval);
    clearInterval(timerInterval);

    gameRunning = true;

    dropMaker = setInterval(createDrop, dropSpawnRate);

    collisionInterval = setInterval(checkCollisions,20);
    timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent =
      timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame();
    }
}, 1000);
}
//milestone message 
function checkMilestones() {
    milestones.forEach(milestone => {
        if (score >= milestone.score && !shownMilestones.includes(milestone.score)
        ) {
            document.getElementById("milestone-message").textContent = milestone.message;
            shownMilestones.push(milestone.score);
        }
    });
}

//Collision Detection
function checkCollisions() {
    if (!gameRunning) return;
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
            updateScore();
            checkMilestones();
            drop.remove();
            if(score >= winScore){
              winGame();
            }
            if(score <= loseScore){
              endGame();
            }
        }
    })
}
//Win screen function 
function winGame() {
    console.log("WIN GAME CALLED");
    console.log(score);
    if (!gameRunning) return;
    gameRunning = false;
    clearInterval(dropMaker);
    clearInterval(collisionInterval);
    clearInterval(timerInterval);
    updateScore();
    hideAllScreens();
    winScreen.classList.add("active");
    console.log(winScreen);
}

//Swipe Support
let touchStartX = 0;
document.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
});

document.addEventListener("touchmove", e => {
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;

    bucketX += diff;

    const container = document.getElementById("game-container");
    const maxX = container.offsetWidth - 90;

    bucketX = Math.max(0, Math.min(bucketX, maxX));

    bucket.style.left = bucketX + "px";

    touchStartX = touchX;
});

//Water Drop Function
function createDrop() {
  if (!gameRunning) return;
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";
  const polluted = Math.random() < pollutedChance;
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
  drop.style.animationDuration = (Math.random()*(dropSpeedMax-dropSpeedMin)+dropSpeedMin)+"s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

//End Game
function endGame() {
    if(!gameRunning) return;
    gameRunning = false;
    clearInterval(dropMaker);
    clearInterval(collisionInterval);
    clearInterval(timerInterval);
    hideAllScreens();
    gameOverScreen.classList.add("active");
    updateScore();
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
setDifficulty("easy");

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
    clearInterval(dropMaker);
    clearInterval(collisionInterval);
    clearInterval(timerInterval);
    gameRunning=false;
    score = 0;
    shownMilestones = [];
    document.getElementById("milestone-message").textContent = "";
    timeLeft = difficulty==="easy"
    ?30
    :difficulty==="normal"
    ?28
    :25;
    bucketX = 350;
    document.getElementById("time").textContent = timeLeft;
    updateScore();
    document.getElementById("goal").textContent = "0%";
    document.getElementById("progress-fill").style.width = "0%";
    bucket.style.left = bucketX + "px";
    document.querySelectorAll(".water-drop").forEach(drop=>drop.remove());
    hideAllScreens();
    startGame();
}