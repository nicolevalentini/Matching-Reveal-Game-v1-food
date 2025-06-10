const symbols = ["🍵", "🍰", "🍜", "🍙", "🍡", "🍣", "🍤", "🍛", "🍚", "🍘", "🍢", "🥠"]
const tiles = symbols.concat(symbols)
let firstTile = null
let canClick = true
let gameTimer
let timeRemaining = 120
let matchedPairs = 0
let soundEnabled = true

const backgroundMusic = document.getElementById("backgroundMusic")

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5)
}

function toggleSound() {
  soundEnabled = !soundEnabled
  const soundIcon = document.getElementById("soundIcon")
  soundIcon.textContent = soundEnabled ? "🔊" : "🔇"

  if (!soundEnabled && backgroundMusic) {
    backgroundMusic.pause()
  }
}

function updateProgress() {
  const progressText = document.getElementById("progressText")
  const progressContainer = document.getElementById("progressContainer")

  if (progressText) {
    progressText.textContent = `${matchedPairs}/${symbols.length}`
  }

  if (progressContainer) {
    progressContainer.style.display = "block"
  }
}

function resetToMenu() {
  // Stop timer and music
  clearInterval(gameTimer)
  if (backgroundMusic) {
    backgroundMusic.pause()
    backgroundMusic.currentTime = 0
  }

  // Hide all game elements
  document.getElementById("gameBoard").style.display = "none"
  document.getElementById("timerContainer").style.display = "none"
  document.getElementById("envelopeContainer").style.display = "none"
  document.getElementById("progressContainer").style.display = "none"

  // Show instructions
  const instructionsBox = document.getElementById("instructionsBox")
  instructionsBox.style.display = "block"
  instructionsBox.style.opacity = "1"

  // Reset instructions content
  instructionsBox.innerHTML = `
    <div class="instruction-content">
      <h2>Welcome to Memory Match!</h2>
      <p>Match all the food tiles to reveal a special message.</p>
      <p class="time-info">You have 2 minutes to complete the challenge.</p>
      <button class="start-button" onclick="startGame()">
        <span class="button-icon">▶</span>
        Start Game
      </button>
    </div>
  `

  // Reset game variables
  matchedPairs = 0
  timeRemaining = 120
  firstTile = null
  canClick = true
}

function startGame() {
  const gameBoard = document.getElementById("gameBoard")
  const timerContainer = document.getElementById("timerContainer")
  const timerText = document.getElementById("timerText")
  const instructionsBox = document.getElementById("instructionsBox")

  // Reset game state
  document.getElementById("envelopeContainer").style.display = "none"
  instructionsBox.style.opacity = "0"
  setTimeout(() => {
    instructionsBox.style.display = "none"
  }, 300)

  gameBoard.style.display = "grid"
  gameBoard.innerHTML = ""
  timeRemaining = 120
  matchedPairs = 0
  timerText.innerText = timeRemaining

  // Show timer and progress
  timerContainer.style.display = "block"
  timerContainer.classList.remove("timer-warning")
  updateProgress()

  const shuffled = shuffleArray([...tiles])
  shuffled.forEach((symbol, index) => {
    const tile = document.createElement("div")
    tile.className = "game-tile"
    tile.dataset.symbol = symbol
    tile.dataset.index = index
    tile.innerText = ""
    tile.onclick = () => handleTileClick(tile)
    gameBoard.appendChild(tile)
  })

  startCountdown()

  if (backgroundMusic && soundEnabled) {
    backgroundMusic.currentTime = 0
    backgroundMusic.play().catch((e) => console.log("Could not play background music"))
    backgroundMusic.loop = true
  }
}

function startCountdown() {
  clearInterval(gameTimer)

  gameTimer = setInterval(() => {
    timeRemaining--
    const timerText = document.getElementById("timerText")
    const timerContainer = document.getElementById("timerContainer")
    timerText.innerText = timeRemaining

    if (timeRemaining <= 10) {
      timerContainer.classList.add("timer-warning")

      if (timeRemaining <= 5) {
        const tickSound = document.getElementById("tickSound")
        if (tickSound && soundEnabled) {
          tickSound.currentTime = 0
          tickSound.play().catch((e) => console.log("Could not play tick sound"))
        }
      }
    }

    if (timeRemaining <= 0) {
      clearInterval(gameTimer)
      endGame(false)
    }
  }, 1000)
}

function endGame(won) {
  clearInterval(gameTimer)
  document.getElementById("timerContainer").style.display = "none"
  document.getElementById("progressContainer").style.display = "none"

  if (backgroundMusic) {
    backgroundMusic.pause()
    backgroundMusic.currentTime = 0
  }

  if (won) {
    celebrateWin()
  } else {
    const timeoutSound = document.getElementById("timeoutSound")
    if (timeoutSound && soundEnabled) {
      timeoutSound.currentTime = 0
      timeoutSound.play().catch((e) => console.log("Could not play timeout sound"))
    }

    document.getElementById("gameBoard").style.display = "none"

    const instructionsBox = document.getElementById("instructionsBox")
    instructionsBox.style.display = "block"
    instructionsBox.style.opacity = "1"
    instructionsBox.innerHTML = `
      <div class="instruction-content">
        <h2 style="color: #d32f2f;">Time's Up!</h2>
        <p>You ran out of time. Would you like to try again?</p>
        <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
          <button class="start-button" onclick="startGame()">
            <span class="button-icon">🔄</span>
            Try Again
          </button>
          <button class="action-button secondary" onclick="resetToMenu()">
            Back to Menu
          </button>
        </div>
      </div>
    `
  }
}

function handleTileClick(tile) {
  if (!canClick || tile.innerText !== "" || tile.classList.contains("matched")) return

  const clickSound = document.getElementById("clickSound")
  if (clickSound && soundEnabled) {
    clickSound.currentTime = 0
    clickSound.play().catch((e) => console.log("Could not play click sound"))
  }

  tile.innerText = tile.dataset.symbol
  tile.classList.add("flipped")

  if (!firstTile) {
    firstTile = tile
  } else {
    canClick = false
    if (firstTile.dataset.symbol === tile.dataset.symbol && firstTile !== tile) {
      const matchSound = document.getElementById("matchSound")
      if (matchSound && soundEnabled) {
        matchSound.currentTime = 0
        matchSound.play().catch((e) => console.log("Could not play match sound"))
      }

      setTimeout(() => {
        firstTile.classList.add("matched")
        tile.classList.add("matched")
        firstTile.classList.remove("flipped")
        tile.classList.remove("flipped")

        matchedPairs++
        updateProgress()

        firstTile = null
        canClick = true
        checkWin()
      }, 500)
    } else {
      setTimeout(() => {
        tile.innerText = ""
        firstTile.innerText = ""
        tile.classList.remove("flipped")
        firstTile.classList.remove("flipped")
        firstTile = null
        canClick = true
      }, 1000)
    }
  }
}

function checkWin() {
  if (matchedPairs === symbols.length) {
    clearInterval(gameTimer)
    document.getElementById("timerContainer").style.display = "none"
    document.getElementById("progressContainer").style.display = "none"
    celebrateWin()
  }
}

function celebrateWin() {
  document.getElementById("gameBoard").style.display = "none"
  document.getElementById("instructionsBox").style.opacity = "0"

  if (backgroundMusic) {
    backgroundMusic.pause()
    backgroundMusic.currentTime = 0
  }

  document.getElementById("envelopeContainer").style.display = "block"

  const winSound = document.getElementById("winSound")
  if (winSound && soundEnabled) {
    winSound.currentTime = 0
    winSound.play().catch((e) => console.log("Could not play win sound"))
  }

  createConfetti()

  setTimeout(() => {
    document.getElementById("envelopeFlap").classList.add("open")

    const envelopeSound = document.getElementById("envelopeSound")
    if (envelopeSound && soundEnabled) {
      envelopeSound.currentTime = 0
      envelopeSound.play().catch((e) => console.log("Could not play envelope sound"))
    }

    setTimeout(() => {
      document.getElementById("envelopeLetter").classList.add("reveal")

      setTimeout(() => {
        document.getElementById("messageContent").classList.add("show")

        setTimeout(() => {
          document.getElementById("actionButtons").classList.add("show")
        }, 800)
      }, 500)
    }, 1000)
  }, 500)
}

function createConfetti() {
  const confettiWrapper = document.getElementById("confettiWrapper")
  const colors = ["#ff8563", "#ffce47", "#a5dd9b", "#60c1e8", "#f588eb"]

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div")
    confetti.style.position = "absolute"
    confetti.style.width = Math.random() * 10 + 5 + "px"
    confetti.style.height = Math.random() * 10 + 5 + "px"
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.left = Math.random() * 100 + "vw"
    confetti.style.top = -20 + "px"
    confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0"
    confetti.style.opacity = Math.random() * 0.7 + 0.3
    confetti.style.zIndex = "1001"

    confettiWrapper.appendChild(confetti)

    const duration = Math.random() * 3 + 2
    const rotation = Math.random() * 360

    confetti.animate(
      [
        { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(100vh) rotate(${rotation}deg)`, opacity: 0 },
      ],
      {
        duration: duration * 1000,
        easing: "cubic-bezier(0.17, 0.67, 0.83, 0.67)",
        fill: "forwards",
      },
    )

    setTimeout(() => {
      confetti.remove()
    }, duration * 1000)
  }
}
