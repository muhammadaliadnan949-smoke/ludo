/**
 * Ludo Classic - UI Controller & DOM Handler
 */

class UIController {
  constructor() {
    this.game = new LudoEngine();
    this.selectedMode = 'classic';
    
    // Stats state stored in localStorage
    this.stats = this.loadStats();

    // DOM Screen Elements
    this.homeScreen = document.getElementById('home-screen');
    this.lobbyScreen = document.getElementById('lobby-screen');
    this.gameScreen = document.getElementById('game-screen');
    
    // Modals
    this.settingsModal = document.getElementById('settings-modal');
    this.rulesModal = document.getElementById('rules-modal');
    this.victoryModal = document.getElementById('victory-modal');
    this.pauseModal = document.getElementById('pause-modal');

    // Lobby Slot Configuration
    this.lobbySlots = {
      red: { active: true, isAI: false, name: 'Player 1' },
      green: { active: true, isAI: true, name: 'Robot 1' },
      yellow: { active: false, isAI: true, name: 'Empty' },
      blue: { active: false, isAI: true, name: 'Empty' }
    };

    this.isAiRolling = false;
    this.initEvents();
    this.renderLobby();
    this.updateStatsDisplay();
  }

  loadStats() {
    const saved = localStorage.getItem('ludo_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { wins: 14, matches: 28, rank: 'Gold II', coins: 1200 };
  }

  saveStats() {
    localStorage.setItem('ludo_stats', JSON.stringify(this.stats));
  }

  updateStatsDisplay() {
    const winsEl = document.getElementById('stat-wins');
    const rankEl = document.getElementById('stat-rank');
    const coinsEl = document.getElementById('stat-coins');
    if (winsEl) winsEl.textContent = this.stats.wins;
    if (rankEl) rankEl.textContent = this.stats.rank;
    if (coinsEl) coinsEl.textContent = this.stats.coins;
  }

  showScreen(screenName) {
    this.homeScreen.classList.add('hidden');
    this.lobbyScreen.classList.add('hidden');
    this.gameScreen.classList.add('hidden');

    if (screenName === 'home') this.homeScreen.classList.remove('hidden');
    if (screenName === 'lobby') this.lobbyScreen.classList.remove('hidden');
    if (screenName === 'game') this.gameScreen.classList.remove('hidden');
  }

  initEvents() {
    // Navigation Buttons
    document.getElementById('btn-play-online')?.addEventListener('click', () => this.openLobby('online'));
    document.getElementById('btn-play-friends')?.addEventListener('click', () => this.openLobby('friends'));
    document.getElementById('btn-play-computer')?.addEventListener('click', () => this.openLobby('vs-ai'));
    document.getElementById('btn-pass-play')?.addEventListener('click', () => this.openLobby('pass-play'));

    document.getElementById('btn-back-lobby')?.addEventListener('click', () => this.showScreen('home'));
    document.getElementById('btn-start-game')?.addEventListener('click', () => this.startGame());

    // Settings & Rules Modals
    document.querySelectorAll('.btn-open-settings').forEach(btn => {
      btn.addEventListener('click', () => this.settingsModal.classList.remove('hidden'));
    });
    document.getElementById('btn-close-settings')?.addEventListener('click', () => this.settingsModal.classList.add('hidden'));

    document.getElementById('btn-toggle-sound')?.addEventListener('click', (e) => {
      const enabled = window.audioManager.toggleSound();
      const statusText = document.getElementById('sound-status');
      if (statusText) statusText.textContent = enabled ? 'ON' : 'OFF';
    });

    document.getElementById('btn-pause-game')?.addEventListener('click', () => this.pauseModal.classList.remove('hidden'));
    document.getElementById('btn-resume-game')?.addEventListener('click', () => this.pauseModal.classList.add('hidden'));
    document.getElementById('btn-exit-game')?.addEventListener('click', () => {
      this.pauseModal.classList.add('hidden');
      this.showScreen('home');
    });

    // Claim Daily Reward
    document.getElementById('btn-claim-reward')?.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      if (!btn.disabled) {
        btn.disabled = true;
        btn.textContent = 'Claimed!';
        this.stats.coins += 500;
        this.saveStats();
        this.updateStatsDisplay();
        window.audioManager.playVictory();
      }
    });

    // Game Mode Switchers in Lobby
    const modeButtons = document.querySelectorAll('.mode-toggle-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = btn.dataset.mode;
        this.selectedMode = mode;
        modeButtons.forEach(b => {
          b.classList.remove('bg-surface', 'text-on-surface', 'shadow-sm');
          b.classList.add('text-on-surface-variant');
        });
        btn.classList.add('bg-surface', 'text-on-surface', 'shadow-sm');
        btn.classList.remove('text-on-surface-variant');

        const modeDesc = document.getElementById('mode-description');
        if (modeDesc) {
          modeDesc.textContent = mode === 'classic'
            ? 'Standard rules. Tokens must roll a 6 to enter the board.'
            : 'Fast paced! 1 token starts on board for each player.';
        }
      });
    });

    // Dice Roll Button in Game
    document.getElementById('btn-roll-dice')?.addEventListener('click', () => this.handleHumanDiceRoll());
    document.getElementById('dice-element')?.addEventListener('click', () => this.handleHumanDiceRoll());

    // Play Again / Exit from Victory Modal
    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      this.victoryModal.classList.add('hidden');
      this.startGame();
    });
    document.getElementById('btn-victory-home')?.addEventListener('click', () => {
      this.victoryModal.classList.add('hidden');
      this.showScreen('home');
    });
  }

  openLobby(preset) {
    if (preset === 'vs-ai') {
      this.lobbySlots = {
        red: { active: true, isAI: false, name: 'Player 1' },
        green: { active: true, isAI: true, name: 'Robot 1' },
        yellow: { active: true, isAI: true, name: 'Robot 2' },
        blue: { active: true, isAI: true, name: 'Robot 3' }
      };
    } else if (preset === 'pass-play') {
      this.lobbySlots = {
        red: { active: true, isAI: false, name: 'Player 1' },
        green: { active: true, isAI: false, name: 'Player 2' },
        yellow: { active: true, isAI: false, name: 'Player 3' },
        blue: { active: true, isAI: false, name: 'Player 4' }
      };
    } else {
      this.lobbySlots = {
        red: { active: true, isAI: false, name: 'Player 1' },
        green: { active: true, isAI: true, name: 'Robot 1' },
        yellow: { active: false, isAI: true, name: 'Empty' },
        blue: { active: false, isAI: true, name: 'Empty' }
      };
    }
    this.renderLobby();
    this.showScreen('lobby');
  }

  renderLobby() {
    const slotColors = ['red', 'green', 'yellow', 'blue'];
    slotColors.forEach(color => {
      const slotEl = document.getElementById(`lobby-slot-${color}`);
      if (!slotEl) return;
      const config = this.lobbySlots[color];

      if (!config.active) {
        slotEl.innerHTML = `
          <div class="w-16 h-16 rounded-full bg-surface-variant shadow-inner flex items-center justify-center mb-3 border border-outline-variant border-dashed">
            <span class="material-symbols-outlined text-on-surface-variant text-3xl">add</span>
          </div>
          <span class="text-label-md font-bold text-on-surface-variant mb-2">Empty</span>
          <div class="flex gap-2 w-full justify-center">
            <button onclick="ui.setSlot('${color}', true, false, 'Player')" class="flex-1 py-2 px-2 bg-primary text-on-primary rounded-lg shadow-sm text-label-sm font-bold flex flex-col items-center gap-1 hover:bg-primary-container tactile-button">
              <span class="material-symbols-outlined text-lg">person</span> Add
            </button>
            <button onclick="ui.setSlot('${color}', true, true, 'Robot')" class="flex-1 py-2 px-2 bg-surface rounded-lg shadow-sm text-on-surface text-label-sm font-bold border border-outline-variant flex flex-col items-center gap-1 hover:bg-surface-variant tactile-button">
              <span class="material-symbols-outlined text-lg">smart_toy</span> AI
            </button>
          </div>
        `;
      } else {
        const icon = config.isAI ? 'smart_toy' : 'person';
        const colorBg = `color-slot-${color}`;
        slotEl.innerHTML = `
          <div class="w-16 h-16 rounded-full ${colorBg} shadow-md flex items-center justify-center mb-3 relative">
            <span class="material-symbols-outlined text-white text-3xl">${icon}</span>
          </div>
          <span class="text-label-md font-bold text-on-surface mb-2">${config.name}</span>
          <div class="flex gap-2 w-full justify-center">
            <button onclick="ui.toggleSlotAI('${color}')" class="flex-1 py-2 px-1 bg-surface rounded-lg shadow-sm text-on-surface text-label-sm font-bold border border-outline-variant flex flex-col items-center gap-1 hover:bg-surface-variant tactile-button">
              <span class="material-symbols-outlined text-lg">${config.isAI ? 'person' : 'smart_toy'}</span>
              ${config.isAI ? 'Human' : 'AI'}
            </button>
            <button onclick="ui.setSlot('${color}', false, true, 'Empty')" class="flex-1 py-2 px-1 bg-error text-on-error rounded-lg shadow-sm text-label-sm font-bold border border-error flex flex-col items-center gap-1 hover:bg-error-container hover:text-error tactile-button">
              <span class="material-symbols-outlined text-lg">close</span> Remove
            </button>
          </div>
        `;
      }
    });
  }

  setSlot(color, active, isAI, namePrefix) {
    this.lobbySlots[color] = {
      active,
      isAI,
      name: active ? (isAI ? `${namePrefix} ${color.toUpperCase()}` : `${namePrefix} ${color.toUpperCase()}`) : 'Empty'
    };
    this.renderLobby();
  }

  toggleSlotAI(color) {
    if (this.lobbySlots[color]) {
      this.lobbySlots[color].isAI = !this.lobbySlots[color].isAI;
      this.lobbySlots[color].name = this.lobbySlots[color].isAI ? `Robot ${color}` : `Player ${color}`;
      this.renderLobby();
    }
  }

  startGame() {
    const activeCount = Object.values(this.lobbySlots).filter(s => s.active).length;
    if (activeCount < 2) {
      alert('Please select at least 2 players to start!');
      return;
    }

    this.game.resetGame({
      mode: this.selectedMode,
      players: this.lobbySlots
    });

    this.renderGameBoard();
    this.renderAllTokens();
    this.updateTurnUI();
    this.showScreen('game');

    // If initial player is AI, trigger AI turn
    this.checkAITurn();
  }

  renderGameBoard() {
    const boardEl = document.getElementById('ludo-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    // Create 15x15 cell grid
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        // Skip cells inside home bases and center finish (they are rendered as larger containers)
        if (r < 6 && c < 6) continue; // Red Home
        if (r < 6 && c > 8) continue; // Green Home
        if (r > 8 && c > 8) continue; // Yellow Home
        if (r > 8 && c < 6) continue; // Blue Home
        if (r >= 6 && r <= 8 && c >= 6 && c <= 8) continue; // Center finish

        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.id = `cell-${r}-${c}`;

        // Colored path highlights for home stretches
        if (r === 7 && c >= 1 && c <= 5) cell.classList.add('cell-red-path');
        if (c === 7 && r >= 1 && r <= 5) cell.classList.add('cell-green-path');
        if (r === 7 && c >= 9 && c <= 13) cell.classList.add('cell-yellow-path');
        if (c === 7 && r >= 9 && r <= 13) cell.classList.add('cell-blue-path');

        // Colored starting cells
        if (r === 6 && c === 1) cell.classList.add('cell-red-path');
        if (r === 1 && c === 8) cell.classList.add('cell-green-path');
        if (r === 8 && c === 13) cell.classList.add('cell-yellow-path');
        if (r === 13 && c === 6) cell.classList.add('cell-blue-path');

        // Safe Star icons
        const safeGridCoords = [
          { r: 6, c: 1 }, { r: 2, c: 6 }, { r: 1, c: 8 }, { r: 6, c: 12 },
          { r: 8, c: 13 }, { r: 12, c: 8 }, { r: 13, c: 6 }, { r: 8, c: 2 }
        ];

        if (safeGridCoords.some(sg => sg.r === r && sg.c === c)) {
          const star = document.createElement('span');
          star.className = 'material-symbols-outlined cell-star-icon';
          star.style.fontVariationSettings = "'FILL' 1";
          star.textContent = 'star';
          cell.appendChild(star);
        }

        boardEl.appendChild(cell);
      }
    }

    // Append 4 Home Bases & Center Finish
    boardEl.appendChild(this.createHomeBase('red', '1 / 7', '1 / 7'));
    boardEl.appendChild(this.createHomeBase('green', '1 / 7', '10 / 16'));
    boardEl.appendChild(this.createHomeBase('yellow', '10 / 16', '10 / 16'));
    boardEl.appendChild(this.createHomeBase('blue', '10 / 16', '1 / 7'));
    boardEl.appendChild(this.createCenterFinish());
  }

  createHomeBase(color, gridRow, gridCol) {
    const base = document.createElement('div');
    base.className = `home-base ${color}`;
    base.style.gridRow = gridRow;
    base.style.gridColumn = gridCol;

    const inner = document.createElement('div');
    inner.className = 'home-inner';

    for (let i = 0; i < 4; i++) {
      const placeholder = document.createElement('div');
      placeholder.className = 'token-placeholder';
      placeholder.id = `base-placeholder-${color}-${i}`;
      inner.appendChild(placeholder);
    }

    base.appendChild(inner);
    return base;
  }

  createCenterFinish() {
    const center = document.createElement('div');
    center.className = 'center-finish';
    center.style.gridRow = '7 / 10';
    center.style.gridColumn = '7 / 10';
    center.id = 'cell-7-7';

    center.innerHTML = `
      <div class="triangle-top"></div>
      <div class="triangle-right"></div>
      <div class="triangle-bottom"></div>
      <div class="triangle-left"></div>
      <span class="material-symbols-outlined center-star" style="font-variation-settings: 'FILL' 1;">star</span>
    `;
    return center;
  }

  renderAllTokens() {
    // Clear old token DOM elements
    document.querySelectorAll('.ludo-token').forEach(el => el.remove());

    const mapCellTokens = {};

    this.game.PLAYERS.forEach(color => {
      if (!this.game.playersConfig[color]?.active) return;

      this.game.tokens[color].forEach(token => {
        const tokenEl = document.createElement('div');
        tokenEl.className = `ludo-token ${color}`;
        tokenEl.id = `token-${color}-${token.id}`;

        let parentContainer = null;

        if (token.step === -1) {
          parentContainer = document.getElementById(`base-placeholder-${color}-${token.id}`);
        } else {
          const coords = this.game.getTokenGridCoords(color, token.step);
          parentContainer = document.getElementById(`cell-${coords.r}-${coords.c}`);

          const cellKey = `${coords.r}-${coords.c}`;
          if (!mapCellTokens[cellKey]) mapCellTokens[cellKey] = [];
          mapCellTokens[cellKey].push(tokenEl);
        }

        if (parentContainer) {
          parentContainer.appendChild(tokenEl);
        }
      });
    });

    // Handle token stacking layout adjustments on cells with multiple tokens
    Object.keys(mapCellTokens).forEach(cellKey => {
      const tokensInCell = mapCellTokens[cellKey];
      const cellEl = document.getElementById(`cell-${cellKey}`);
      if (cellEl) {
        cellEl.classList.remove('stacked-2', 'stacked-3', 'stacked-4');
        if (tokensInCell.length === 2) cellEl.classList.add('stacked-2');
        if (tokensInCell.length === 3) cellEl.classList.add('stacked-3');
        if (tokensInCell.length >= 4) cellEl.classList.add('stacked-4');
      }
    });
  }

  updateTurnUI() {
    const currentColor = this.game.getCurrentPlayerColor();
    const playerConfig = this.game.getCurrentPlayerConfig();

    const turnPlayerNameEl = document.getElementById('turn-player-name');
    const turnColorDot = document.getElementById('turn-color-dot');
    const rollButton = document.getElementById('btn-roll-dice');

    if (turnPlayerNameEl) turnPlayerNameEl.textContent = playerConfig.name;
    if (turnColorDot) {
      turnColorDot.className = `w-4 h-4 rounded-full bg-ludo-${currentColor} shadow-sm`;
    }

    // Highlight active player panel
    this.game.PLAYERS.forEach(color => {
      const panel = document.getElementById(`player-panel-${color}`);
      if (panel) {
        panel.classList.remove('pulse-ring-red', 'pulse-ring-green', 'pulse-ring-yellow', 'pulse-ring-blue', 'border-2');
        if (color === currentColor) {
          panel.classList.add(`pulse-ring-${color}`, 'border-2');
        }
      }
    });

    if (rollButton) {
      rollButton.disabled = playerConfig.isAI || this.game.state !== 'ROLL_DICE';
      rollButton.classList.toggle('opacity-50', rollButton.disabled);
    }
  }

  renderDicePips(value) {
    const diceEl = document.getElementById('dice-element');
    if (!diceEl) return;

    // Standard dice pip patterns (9-grid positions)
    const pipPatterns = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };

    const pattern = pipPatterns[value] || [];

    let pipsHTML = '<div class="dice-pip-grid">';
    for (let i = 0; i < 9; i++) {
      if (pattern.includes(i)) {
        pipsHTML += '<div class="pip"></div>';
      } else {
        pipsHTML += '<div></div>';
      }
    }
    pipsHTML += '</div>';
    diceEl.innerHTML = pipsHTML;
  }

  handleHumanDiceRoll() {
    if (this.game.state !== 'ROLL_DICE') return;
    const playerConfig = this.game.getCurrentPlayerConfig();
    if (playerConfig.isAI || this.isAiRolling) return;

    this.executeDiceRoll();
  }

  executeDiceRoll() {
    const diceEl = document.getElementById('dice-element');
    if (diceEl) {
      diceEl.classList.add('rolling');
      window.audioManager.playDiceRoll();
      setTimeout(() => diceEl.classList.remove('rolling'), 600);
    }

    const result = this.game.rollDice();
    if (!result) return;

    this.renderDicePips(result.roll);

    if (result.forfeited) {
      alert('3 Consecutive 6s! Turn forfeited.');
      this.updateTurnUI();
      this.checkAITurn();
      return;
    }

    if (result.movableTokens && result.movableTokens.length > 0) {
      this.highlightMovableTokens(result.movableTokens);
    } else {
      // No legal moves
      setTimeout(() => {
        this.updateTurnUI();
        this.checkAITurn();
      }, 1000);
    }
  }

  highlightMovableTokens(movableTokens) {
    const currentColor = this.game.getCurrentPlayerColor();
    const isAI = this.game.getCurrentPlayerConfig().isAI;

    movableTokens.forEach(token => {
      const tokenEl = document.getElementById(`token-${currentColor}-${token.id}`);
      if (tokenEl) {
        tokenEl.classList.add('movable');

        if (!isAI) {
          const clickHandler = () => {
            this.clearTokenHighlights();
            this.executeTokenMove(currentColor, token.id);
          };
          tokenEl.onclick = clickHandler;
        }
      }
    });
  }

  clearTokenHighlights() {
    document.querySelectorAll('.ludo-token.movable').forEach(el => {
      el.classList.remove('movable');
      el.onclick = null;
    });
  }

  executeTokenMove(color, tokenId) {
    const result = this.game.moveToken(color, tokenId);
    if (!result) return;

    window.audioManager.playTokenMove();
    this.renderAllTokens();

    if (result.captured) {
      window.audioManager.playCapture();
    } else if (result.finished) {
      window.audioManager.playVictory();
    }

    if (this.game.state === 'GAME_OVER') {
      this.handleGameOver();
      return;
    }

    this.updateTurnUI();

    // If turn advances or remains with AI, continue
    setTimeout(() => {
      this.checkAITurn();
    }, 600);
  }

  checkAITurn() {
    if (this.game.state === 'GAME_OVER') return;

    const playerConfig = this.game.getCurrentPlayerConfig();
    if (!playerConfig.isAI || this.isAiRolling) return;

    this.isAiRolling = true;
    const currentColor = this.game.getCurrentPlayerColor();

    setTimeout(() => {
      const result = this.game.rollDice();
      if (result) {
        const diceEl = document.getElementById('dice-element');
        if (diceEl) {
          diceEl.classList.add('rolling');
          window.audioManager.playDiceRoll();
          setTimeout(() => diceEl.classList.remove('rolling'), 600);
        }
        this.renderDicePips(result.roll);

        if (result.movableTokens && result.movableTokens.length > 0) {
          const bestToken = this.game.getBestAIMove(currentColor, result.roll, result.movableTokens);
          setTimeout(() => {
            this.isAiRolling = false;
            this.executeTokenMove(currentColor, bestToken.id);
          }, 800);
        } else {
          setTimeout(() => {
            this.isAiRolling = false;
            this.updateTurnUI();
            this.checkAITurn();
          }, 1000);
        }
      } else {
        this.isAiRolling = false;
      }
    }, 800);
  }

  handleGameOver() {
    window.audioManager.playVictory();
    
    // Update stats if player 1 (red) won
    if (this.game.rankings[0] === 'red') {
      this.stats.wins += 1;
      this.stats.coins += 300;
      this.saveStats();
      this.updateStatsDisplay();
    }

    const podiumEl = document.getElementById('victory-podium');
    if (podiumEl) {
      podiumEl.innerHTML = this.game.rankings.map((color, index) => {
        const config = this.game.playersConfig[color];
        return `
          <div class="flex items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant">
            <div class="flex items-center gap-3">
              <span class="text-xl font-bold text-primary">#${index + 1}</span>
              <div class="w-8 h-8 rounded-full bg-ludo-${color} flex items-center justify-center text-white font-bold">
                ${color[0].toUpperCase()}
              </div>
              <span class="font-bold text-on-surface">${config.name}</span>
            </div>
            <span class="text-label-sm font-bold text-secondary">${index === 0 ? 'WINNER!' : 'Finished'}</span>
          </div>
        `;
      }).join('');
    }

    this.victoryModal.classList.remove('hidden');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.ui = new UIController();
});
