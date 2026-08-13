/**
 * Ludo Classic - Core Game Engine
 */

class LudoEngine {
  constructor() {
    this.PLAYERS = ['red', 'green', 'yellow', 'blue'];
    
    // 52-cell Outer Track Grid Coordinates (row, col) 0-indexed
    this.OUTER_TRACK = [
      { r: 6, c: 1 },  // 0: Red Start (Safe)
      { r: 6, c: 2 },  // 1
      { r: 6, c: 3 },  // 2
      { r: 6, c: 4 },  // 3
      { r: 6, c: 5 },  // 4
      { r: 5, c: 6 },  // 5
      { r: 4, c: 6 },  // 6
      { r: 3, c: 6 },  // 7
      { r: 2, c: 6 },  // 8: Star (Safe)
      { r: 1, c: 6 },  // 9
      { r: 0, c: 6 },  // 10
      { r: 0, c: 7 },  // 11
      { r: 0, c: 8 },  // 12
      { r: 1, c: 8 },  // 13: Green Start (Safe)
      { r: 2, c: 8 },  // 14
      { r: 3, c: 8 },  // 15
      { r: 4, c: 8 },  // 16
      { r: 5, c: 8 },  // 17
      { r: 6, c: 9 },  // 18
      { r: 6, c: 10 }, // 19
      { r: 6, c: 11 }, // 20
      { r: 6, c: 12 }, // 21: Star (Safe)
      { r: 6, c: 13 }, // 22
      { r: 6, c: 14 }, // 23
      { r: 7, c: 14 }, // 24
      { r: 8, c: 14 }, // 25
      { r: 8, c: 13 }, // 26: Yellow Start (Safe)
      { r: 8, c: 12 }, // 27
      { r: 8, c: 11 }, // 28
      { r: 8, c: 10 }, // 29
      { r: 8, c: 9 },  // 30
      { r: 9, c: 8 },  // 31
      { r: 10, c: 8 }, // 32
      { r: 11, c: 8 }, // 33
      { r: 12, c: 8 }, // 34: Star (Safe)
      { r: 13, c: 8 }, // 35
      { r: 14, c: 8 }, // 36
      { r: 14, c: 7 }, // 37
      { r: 14, c: 6 }, // 38
      { r: 13, c: 6 }, // 39: Blue Start (Safe)
      { r: 12, c: 6 }, // 40
      { r: 11, c: 6 }, // 41
      { r: 10, c: 6 }, // 42
      { r: 9, c: 6 },  // 43
      { r: 8, c: 5 },  // 44
      { r: 8, c: 4 },  // 45
      { r: 8, c: 3 },  // 46
      { r: 8, c: 2 },  // 47: Star (Safe)
      { r: 8, c: 1 },  // 48
      { r: 8, c: 0 },  // 49
      { r: 7, c: 0 },  // 50
      { r: 6, c: 0 }   // 51
    ];

    // Safe indices on Outer Track
    this.SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

    // Starting indices on Outer Track per color
    this.START_INDICES = {
      red: 0,
      green: 13,
      yellow: 26,
      blue: 39
    };

    // Home Stretches per color (5 cells + 1 finish cell)
    this.HOME_STRETCHES = {
      red: [
        { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }
      ],
      green: [
        { r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 6, c: 7 }
      ],
      yellow: [
        { r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }, { r: 7, c: 8 }
      ],
      blue: [
        { r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }, { r: 8, c: 7 }
      ]
    };

    // Home Base Token Placeholder Grid Positions
    this.BASE_POSITIONS = {
      red: [ { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 3 } ],
      green: [ { r: 2, c: 11 }, { r: 2, c: 12 }, { r: 3, c: 11 }, { r: 3, c: 12 } ],
      yellow: [ { r: 11, c: 11 }, { r: 11, c: 12 }, { r: 12, c: 11 }, { r: 12, c: 12 } ],
      blue: [ { r: 11, c: 2 }, { r: 11, c: 3 }, { r: 12, c: 2 }, { r: 12, c: 3 } ]
    };

    this.resetGame();
  }

  resetGame(config = {}) {
    this.gameMode = config.mode || 'classic'; // 'classic' or 'quick'
    
    // Player Configuration map
    // { color: { active: true/false, isAI: true/false, name: string } }
    this.playersConfig = config.players || {
      red: { active: true, isAI: false, name: 'Player 1' },
      green: { active: true, isAI: true, name: 'Robot 1' },
      yellow: { active: false, isAI: true, name: 'Empty' },
      blue: { active: false, isAI: true, name: 'Empty' }
    };

    // Tokens state for each player:
    // array of 4 tokens: { id: 0..3, step: -1 (base), 0..50 (track relative), 51..55 (home stretch), 56 (finished) }
    this.tokens = {
      red: [0, 1, 2, 3].map(i => ({ id: i, step: this.gameMode === 'quick' && i === 0 ? 0 : -1 })),
      green: [0, 1, 2, 3].map(i => ({ id: i, step: this.gameMode === 'quick' && i === 0 ? 0 : -1 })),
      yellow: [0, 1, 2, 3].map(i => ({ id: i, step: this.gameMode === 'quick' && i === 0 ? 0 : -1 })),
      blue: [0, 1, 2, 3].map(i => ({ id: i, step: this.gameMode === 'quick' && i === 0 ? 0 : -1 }))
    };

    this.activePlayerList = this.PLAYERS.filter(c => this.playersConfig[c] && this.playersConfig[c].active);
    this.currentTurnIndex = 0;
    this.diceRoll = null;
    this.consecutiveSixes = 0;
    this.state = 'ROLL_DICE'; // 'ROLL_DICE', 'MOVE_TOKEN', 'GAME_OVER'
    this.rankings = []; // array of finished player colors
    this.bonusRollGranted = false;
  }

  getCurrentPlayerColor() {
    return this.activePlayerList[this.currentTurnIndex];
  }

  getCurrentPlayerConfig() {
    return this.playersConfig[this.getCurrentPlayerColor()];
  }

  rollDice() {
    if (this.state !== 'ROLL_DICE') return null;

    const roll = Math.floor(Math.random() * 6) + 1;
    this.diceRoll = roll;

    if (roll === 6) {
      this.consecutiveSixes++;
    } else {
      this.consecutiveSixes = 0;
    }

    // Rule: 3 consecutive 6s forfeits the turn
    if (this.consecutiveSixes === 3) {
      this.consecutiveSixes = 0;
      this.diceRoll = null;
      this.nextTurn();
      return { roll, forfeited: true };
    }

    const movableTokens = this.getMovableTokens(this.getCurrentPlayerColor(), roll);

    if (movableTokens.length === 0) {
      // No legal moves
      setTimeout(() => {
        if (roll === 6) {
          // Roll again on 6 even if no move, or next turn
          this.state = 'ROLL_DICE';
        } else {
          this.nextTurn();
        }
      }, 800);
      return { roll, movableTokens: [] };
    } else {
      this.state = 'MOVE_TOKEN';
      return { roll, movableTokens };
    }
  }

  getMovableTokens(color, roll) {
    const playerTokens = this.tokens[color];
    const movable = [];

    playerTokens.forEach(t => {
      if (t.step === -1) {
        // In base: needs 6 to move out
        if (roll === 6) {
          movable.push(t);
        }
      } else if (t.step >= 0 && t.step < 56) {
        // On track or home stretch: total distance to finish is 56 (step 56 is finished)
        if (t.step + roll <= 56) {
          movable.push(t);
        }
      }
    });

    return movable;
  }

  moveToken(color, tokenId) {
    if (this.state !== 'MOVE_TOKEN' || color !== this.getCurrentPlayerColor()) return null;

    const token = this.tokens[color].find(t => t.id === tokenId);
    if (!token) return null;

    const roll = this.diceRoll;
    let captured = null;
    let finished = false;

    if (token.step === -1) {
      // Release from base onto step 0
      token.step = 0;
    } else {
      token.step += roll;
    }

    // Check if token finished (step === 56)
    if (token.step === 56) {
      finished = true;
      this.bonusRollGranted = true;
      this.checkPlayerFinished(color);
    } else if (token.step >= 0 && token.step <= 50) {
      // Check capture on outer track
      const targetGrid = this.getTokenGridCoords(color, token.step);
      const isSafe = this.isGridCoordSafe(targetGrid);

      if (!isSafe) {
        // Check enemy tokens on same grid position
        this.PLAYERS.forEach(otherColor => {
          if (otherColor !== color && this.playersConfig[otherColor]?.active) {
            this.tokens[otherColor].forEach(otherToken => {
              if (otherToken.step >= 0 && otherToken.step <= 50) {
                const enemyGrid = this.getTokenGridCoords(otherColor, otherToken.step);
                if (enemyGrid.r === targetGrid.r && enemyGrid.c === targetGrid.c) {
                  // Capture enemy token!
                  otherToken.step = -1; // Send back to base
                  captured = { color: otherColor, tokenId: otherToken.id };
                  this.bonusRollGranted = true;
                }
              }
            });
          }
        });
      }
    }

    // Handle extra roll or next turn
    const isSix = (roll === 6);
    const getBonusRoll = isSix || this.bonusRollGranted;

    if (this.checkGameOver()) {
      this.state = 'GAME_OVER';
    } else {
      if (getBonusRoll) {
        this.state = 'ROLL_DICE';
        this.bonusRollGranted = false;
      } else {
        this.nextTurn();
      }
    }

    return { token, captured, finished, bonusRoll: getBonusRoll };
  }

  nextTurn() {
    this.consecutiveSixes = 0;
    this.diceRoll = null;
    this.bonusRollGranted = false;

    // Advance turn to next active, non-finished player
    let attempts = 0;
    do {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.activePlayerList.length;
      attempts++;
    } while (this.isPlayerFinished(this.getCurrentPlayerColor()) && attempts < this.activePlayerList.length);

    this.state = 'ROLL_DICE';
  }

  checkPlayerFinished(color) {
    const allFinished = this.tokens[color].every(t => t.step === 56);
    if (allFinished && !this.rankings.includes(color)) {
      this.rankings.push(color);
    }
  }

  isPlayerFinished(color) {
    return this.tokens[color].every(t => t.step === 56);
  }

  checkGameOver() {
    const activeCount = this.activePlayerList.length;
    if (activeCount <= 1) return false;
    return this.rankings.length >= activeCount - 1;
  }

  // Convert token step (0..56) for a given color into board grid (row, col)
  getTokenGridCoords(color, step) {
    if (step === -1) {
      return this.BASE_POSITIONS[color][0]; // fallback
    }
    if (step >= 0 && step <= 50) {
      // Step on outer track relative to player start position
      const startIndex = this.START_INDICES[color];
      const absoluteOuterIndex = (startIndex + step) % 52;
      return this.OUTER_TRACK[absoluteOuterIndex];
    } else if (step >= 51 && step <= 56) {
      // Step in home stretch
      const stretchIndex = step - 51;
      return this.HOME_STRETCHES[color][stretchIndex];
    }
    return { r: 7, c: 7 };
  }

  isGridCoordSafe(gridCoords) {
    return this.SAFE_INDICES.some(index => {
      const safeGrid = this.OUTER_TRACK[index];
      return safeGrid.r === gridCoords.r && safeGrid.c === gridCoords.c;
    });
  }

  // Heuristic AI Decision Maker
  getBestAIMove(color, roll, movableTokens) {
    if (movableTokens.length === 0) return null;
    if (movableTokens.length === 1) return movableTokens[0];

    let bestToken = movableTokens[0];
    let highestScore = -9999;

    movableTokens.forEach(t => {
      let score = 0;

      if (t.step === -1 && roll === 6) {
        // Releasing from base is high priority
        score += 300;
      } else {
        const nextStep = t.step + roll;
        const targetGrid = this.getTokenGridCoords(color, nextStep);

        // 1. Landing in finish
        if (nextStep === 56) {
          score += 500;
        }

        // 2. Capturing an opponent
        if (nextStep <= 50 && !this.isGridCoordSafe(targetGrid)) {
          this.PLAYERS.forEach(otherColor => {
            if (otherColor !== color && this.playersConfig[otherColor]?.active) {
              this.tokens[otherColor].forEach(ot => {
                if (ot.step >= 0 && ot.step <= 50) {
                  const enemyGrid = this.getTokenGridCoords(otherColor, ot.step);
                  if (enemyGrid.r === targetGrid.r && enemyGrid.c === targetGrid.c) {
                    score += 400 + ot.step; // Higher reward for capturing advanced tokens
                  }
                }
              });
            }
          });
        }

        // 3. Landing on a safe spot
        if (this.isGridCoordSafe(targetGrid)) {
          score += 150;
        }

        // 4. Progress distance bonus
        score += nextStep * 2;
      }

      if (score > highestScore) {
        highestScore = score;
        bestToken = t;
      }
    });

    return bestToken;
  }
}

window.LudoEngine = LudoEngine;
