// Game variables
let score = 0;
let time = 0;
let spawnInterval = 2000;
let spawnTimer;
let gameTimer;
let isMuted = false;
let isPaused = false;
let gameStarted = false;
let cockroaches = [];
// PWA Install variables
let deferredPrompt;


// Kill streak variables
let killStreak = 0;
let lastKillTime = 0;
let streakTimer;
const notificationMessages = [
  { threshold: 1, message: "Good!", class: "good" },
  { threshold: 2, message: "Double Splash!", class: "good" },
  { threshold: 3, message: "Triple Splash!", class: "great" },
  { threshold: 5, message: "Killing Spree!", class: "great" },
  { threshold: 7, message: "Roach Rampage!", class: "awesome" },
  { threshold: 10, message: "Maniac!", class: "maniac" },
  { threshold: 15, message: "SAVAGE!", class: "savage" },
];

// DOM elements
const gameArea = document.getElementById('gameArea');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const muteToggle = document.getElementById('muteToggle');
const bgMusic = document.getElementById('bgMusic');
const squishSound = document.getElementById('squishSound');
const status = document.getElementById('status');
const startScreen = document.getElementById('startScreen');
const pauseScreen = document.getElementById('pauseScreen');
const settingsScreen = document.getElementById('settingsScreen');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const quitBtn = document.getElementById('quitBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsBtnMain = document.getElementById('settingsBtnMain');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
const difficultySelect = document.getElementById('difficulty');
const volumeSlider = document.getElementById('volume');
const cursorSelect = document.getElementById('cursor');
const speedUpNotification = document.getElementById('speedUpNotification');
const installBtn = document.getElementById('installBtn');

// Show notification function
function showNotification(message, className = "") {
  const notification = document.createElement('div');
  notification.className = `notification ${className}`;
  notification.textContent = message;
  document.getElementById('notifications').appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

// Initialize game
function initGame() {
  killStreak = 0;
  lastKillTime = 0;
  score = 0;
  time = 0;
  updateScore();
  updateTimer();
  

  // Check if PWA is installable
if (window.matchMedia('(display-mode: standalone)').matches) {
  installBtn.style.display = 'none';
}
  // Clear any existing cockroaches
  gameArea.innerHTML = `
    <div id="speedUpNotification">⚡ Speed Increasing!</div>
    <div id="notifications"></div>
  `;
  cockroaches = [];
  
  // Set difficulty
  switch(difficultySelect.value) {
    case 'easy':
      spawnInterval = 2500;
      break;
    case 'medium':
      spawnInterval = 2000;
      break;
    case 'hard':
      spawnInterval = 1500;
      break;
  }
  
  // Start timers
  spawnTimer = setInterval(spawnCockroach, spawnInterval);
  gameTimer = setInterval(updateTimer, 1000);
  
  // Play music
  bgMusic.currentTime = 0;
  bgMusic.volume = volumeSlider.value;
  bgMusic.play();
  
  gameStarted = true;
  pauseBtn.style.display = 'block';
}

// Pause game
function pauseGame() {
  isPaused = true;
  clearInterval(spawnTimer);
  clearInterval(gameTimer);
  bgMusic.pause();
  pauseScreen.style.display = 'flex';
}

// Resume game
function resumeGame() {
  isPaused = false;
  spawnTimer = setInterval(spawnCockroach, spawnInterval);
  gameTimer = setInterval(updateTimer, 1000);
  bgMusic.play();
  pauseScreen.style.display = 'none';
}

// End game
function endGame() {
  clearInterval(spawnTimer);
  clearInterval(gameTimer);
  bgMusic.pause();
  gameStarted = false;
  pauseBtn.style.display = 'none';
  gameArea.innerHTML = '';
  cockroaches = [];
}

// Update score display
function updateScore() {
  scoreDisplay.textContent = score;
}

// Update timer display
function updateTimer() {
  timerDisplay.textContent = time;
  time++;
  
  // Increase difficulty every 10 seconds
  if (time % 10 === 0 && spawnInterval > 500) {
    clearInterval(spawnTimer);
    spawnInterval -= 200;
    spawnTimer = setInterval(spawnCockroach, spawnInterval);
    
    // Show speed up notification
    speedUpNotification.style.display = 'block';
    setTimeout(() => {
      speedUpNotification.style.display = 'none';
    }, 2000);
    
    // Make existing cockroaches faster
    cockroaches.forEach(roach => {
      if (!roach.classList.contains('dead')) {
        const currentSpeedX = parseFloat(roach.dataset.speedX || 0);
        const currentSpeedY = parseFloat(roach.dataset.speedY || 0);
        roach.dataset.speedX = currentSpeedX * 1.2;
        roach.dataset.speedY = currentSpeedY * 1.2;
      }
    });
  }
}

// Spawn a cockroach
function spawnCockroach() {
  if (isPaused || cockroaches.length > 20) return;
  
  const gameRect = gameArea.getBoundingClientRect();
  const roach = document.createElement('div');
  roach.classList.add('cockroach');
  roach.style.left = `${Math.random() * (gameRect.width - 50)}px`;
  roach.style.top = `${Math.random() * (gameRect.height - 50)}px`;
  
  // Random movement speed
  const speedX = (Math.random() - 0.5) * 4;
  const speedY = (Math.random() - 0.5) * 4;
  roach.dataset.speedX = speedX;
  roach.dataset.speedY = speedY;
  
  cockroaches.push(roach);
  gameArea.appendChild(roach);
  
  // // Movement function
  // const moveRoach = () => {
  //   if (isPaused || roach.classList.contains('dead')) return;
    
  //   const rect = roach.getBoundingClientRect();
  //   const speedX = parseFloat(roach.dataset.speedX);
  //   const speedY = parseFloat(roach.dataset.speedY);
    
  //   let newX = rect.left + speedX;
  //   let newY = rect.top + speedY;
    
  //   // Bounce off walls
  //   if (newX <= 0 || newX >= window.innerWidth - 50) {
  //     roach.dataset.speedX = -speedX;
  //     newX = Math.max(0, Math.min(newX, window.innerWidth - 50));
  //   }
    
  //   if (newY <= 0 || newY >= window.innerHeight - 50) {
  //     roach.dataset.speedY = -speedY;
  //     newY = Math.max(0, Math.min(newY, window.innerHeight - 50));
  //   }
    
  //   roach.style.left = `${newX}px`;
  //   roach.style.top = `${newY}px`;
    
  //   requestAnimationFrame(moveRoach);
  // };
  
  // moveRoach();
  
  roach.addEventListener('click', () => {
    if (!roach.classList.contains('dead')) {
      score++;
      updateScore();
      if (!isMuted) {
        squishSound.currentTime = 0;
        squishSound.play();
      }
      roach.classList.add('dead');
      
      // Kill streak tracking
      const now = Date.now();
      if (now - lastKillTime < 2000) { // 2 seconds between kills to maintain streak
        killStreak++;
        clearTimeout(streakTimer);
      } else {
        killStreak = 1;
      }
      lastKillTime = now;
      
      // Show appropriate notification
      const notification = notificationMessages
        .filter(n => n.threshold === killStreak)
        .pop();
      
      if (notification) {
        showNotification(notification.message, notification.class);
      }
      
      // Reset streak if no kills within 2 seconds
      streakTimer = setTimeout(() => {
        killStreak = 0;
      }, 2000);
      
      // Remove from array
      const index = cockroaches.indexOf(roach);
      if (index > -1) {
        cockroaches.splice(index, 1);
      }
      
      // Remove from DOM after animation (600ms)
      setTimeout(() => {
        if (roach.parentNode) {
          roach.parentNode.removeChild(roach);
        }
      }, 600);
    }
  });
}

// Update cursor based on selection
function updateCursor() {
  const cursorValue = cursorSelect.value;
  let cursorImage = 'assets/images/slipper-cursor.png';
  let hotspotX = 32;
  let hotspotY = 32;
  
  if (cursorValue === 'hand') {
    cursorImage = 'assets/images/hand-cursor.png';
    hotspotX = 16;
    hotspotY = 16;
  } else if (cursorValue === 'hammer') {
    cursorImage = 'assets/images/hammer-cursor.png';
    hotspotX = 8;
    hotspotY = 8;
  }
  
  // Apply to all relevant elements
  document.body.style.cursor = `url('${cursorImage}') ${hotspotX} ${hotspotY}, auto`;
  gameArea.style.cursor = `url('${cursorImage}') ${hotspotX} ${hotspotY}, auto`;
  
  // Update cockroach cursors
  document.querySelectorAll('.cockroach').forEach(roach => {
    roach.style.cursor = `url('${cursorImage}') ${hotspotX} ${hotspotY}, auto`;
  });
}

// Event listeners
startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  initGame();
});

pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
restartBtn.addEventListener('click', () => {
  pauseScreen.style.display = 'none';
  endGame();
  initGame();
});
quitBtn.addEventListener('click', () => {
  pauseScreen.style.display = 'none';
  startScreen.style.display = 'flex';
  endGame();
});
settingsBtn.addEventListener('click', () => {
  if (gameStarted) pauseGame();
  settingsScreen.style.display = 'flex';
});
settingsBtnMain.addEventListener('click', () => {
  settingsScreen.style.display = 'flex';
});
saveSettingsBtn.addEventListener('click', () => {
  updateCursor();
  bgMusic.volume = volumeSlider.value;
  squishSound.volume = volumeSlider.value;
  settingsScreen.style.display = 'none';
  if (gameStarted && isPaused) {
    resumeGame();
  }
});
cancelSettingsBtn.addEventListener('click', () => {
  settingsScreen.style.display = 'none';
  if (gameStarted && isPaused) {
    resumeGame();
  }
});
muteToggle.addEventListener('click', () => {
  isMuted = !isMuted;
  bgMusic.muted = isMuted;
  squishSound.muted = isMuted;
  muteToggle.textContent = isMuted ? '🔇' : '🔊';
});

// Network status
// Network status detection
function updateNetworkStatus() {
  if (navigator.onLine) {
    status.textContent = '🟢 Online';
    status.style.background = 'limegreen';
  } else {
    status.textContent = '🔴 Offline';
    status.style.background = 'crimson';
    // Optional: Show a notification when going offline
    showNotification("You're offline! Game continues but scores won't save", 'good');
  }
}

// Event listeners for network status
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// Initial check
updateNetworkStatus();

// Initial setup
bgMusic.volume = volumeSlider.value;
squishSound.volume = volumeSlider.value;
updateCursor();

// PWA Install functionality
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
  
  // Auto-hide after 15 seconds if not clicked
  setTimeout(() => {
    if (installBtn.style.display !== 'none') {
      installBtn.style.display = 'none';
    }
  }, 15000);
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('User accepted install');
    installBtn.textContent = '✔️ INSTALLED';
    setTimeout(() => {
      installBtn.style.display = 'none';
    }, 2000);
  } else {
    console.log('User dismissed install');
  }
  
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
  deferredPrompt = null;
  console.log('PWA was installed');
});

// Check if already installed
function isRunningStandalone() {
  return (window.matchMedia('(display-mode: standalone)').matches) || 
         (window.navigator.standalone) ||
         (document.referrer.includes('android-app://'));
}

if (isRunningStandalone()) {
  installBtn.style.display = 'none';
}