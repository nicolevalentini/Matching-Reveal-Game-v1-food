<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Matching Reveal Game</title>
  <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Quicksand:wght@400;600&display=swap" rel="stylesheet">
  <style>
   body {
    margin: 0;
    padding: 0;
    font-family: 'Quicksand', sans-serif;
    background: url('eggs.jpg');
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }

    .instructions {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      text-align: center;
      margin-bottom: 20px;
    }

    .start-button {
      background: #ff8563;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      color: white;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .start-button:hover {
      background: #ff6843;
    }

    .game-board {
      display: none;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      max-width: 840px;
      margin-top: 20px;
    }

    .game-tile {
      width: 70px;
      height: 90px;
      background: linear-gradient(to top left, #fef9f5, #f3e5dc);
      border: 3px solid #d8b49c;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: bold;
      border-radius: 12px;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      margin: 4px;
    }

    .game-tile:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 4px 6px 14px rgba(0, 0, 0, 0.2);
    }

    .envelope.reveal {
      animation: floatIn 1s ease-out;
    }

    @keyframes floatIn {
      from { opacity: 0; transform: scale(0.5) translateY(100px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .message-content {
      font-family: 'Pacifico', cursive;
      font-size: 26px;
      color: #5a3e36;
      margin-top: 20px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="instructions">
    <h1>Welcome to the Matching Reveal Game!</h1>
    <p>Match the tiles to reveal a secret message.</p>
    <button class="start-button" onclick="startGame()">Start Game</button>
  </div>
  <div class="game-board" id="gameBoard"></div>
  <div class="message-content" id="messageContent">💌 It's been a beautiful day, thank you 💌</div>
  <audio id="clickSound" src="./mouse-click-sound-233951.mp3" preload="auto"></audio>
  <audio id="matchSound" src="./bubblepop-254773.mp3" preload="auto"></audio>

  <script>
    const symbols = ['🍵','🍰','🍜','🍙','🍡','🍣','🍤','🍛','🍚','🍘','🍢','🥠'];
    const tiles = symbols.concat(symbols); // double the symbols for matching
    let firstTile = null;
    let canClick = true;

    function shuffleArray(arr) {
      return arr.sort(() => Math.random() - 0.5);
    }

    function startGame() {
      const gameBoard = document.getElementById('gameBoard');
      const message = document.getElementById('messageContent');
      message.style.display = 'none';
      gameBoard.style.display = 'flex';
      gameBoard.innerHTML = '';

      const shuffled = shuffleArray([...tiles]);
      shuffled.forEach((symbol, index) => {
        const tile = document.createElement('div');
        tile.className = 'game-tile';
        tile.dataset.symbol = symbol;
        tile.dataset.index = index;
        tile.innerText = '';
        tile.onclick = () => handleTileClick(tile);
        gameBoard.appendChild(tile);
      });
    }

    function handleTileClick(tile) {
      if (!canClick || tile.innerText !== '') return;
      const clickSound = document.getElementById('clickSound');
      clickSound.currentTime = 0;
      clickSound.play();

      tile.innerText = tile.dataset.symbol;

      if (!firstTile) {
        firstTile = tile;
      } else {
        canClick = false;
        if (firstTile.dataset.symbol === tile.dataset.symbol && firstTile !== tile) {
          const matchSound = document.getElementById('matchSound');
          matchSound.currentTime = 0;
          matchSound.play();
          firstTile = null;
          canClick = true;
          checkWin();
        } else {
          setTimeout(() => {
            tile.innerText = '';
            firstTile.innerText = '';
            firstTile = null;
            canClick = true;
          }, 1000);
        }
      }
    }

    function checkWin() {
      const allTiles = document.querySelectorAll('.game-tile');
      const allRevealed = [...allTiles].every(tile => tile.innerText !== '');
      if (allRevealed) {
        document.getElementById('messageContent').style.display = 'block';
        document.getElementById('messageContent').classList.add('envelope', 'reveal');
      }
    }
  </script>
</body>
</html>
