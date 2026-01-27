/**
 * XPGains Main Application
 * Handles UI rendering, navigation, and state management
 */

// ============================================
// STATE MANAGEMENT
// ============================================
const AppState = {
  // Skill XP storage { skillId: xp }
  skillXp: {},

  // Favorite exercises { exerciseId: true }
  favorites: {},

  // Log entries array
  logEntries: [],

  // Recent sets for diminishing XP calculation (per session)
  recentSets: [],

  // Settings
  settings: {
    unit: 'kg' // 'kg' or 'lbs'
  },

  // Current training flow state
  training: {
    skillId: null,
    subcategoryId: null,
    exerciseId: null
  },

  // Active challenge
  challenge: null,

  // Last used weight/reps per exercise { exerciseId: { weight, reps, updatedAt } }
  lastExerciseInputs: {},

  // Friends system
  friends: {
    favorites: {},        // { name: true } - starred friends
    sharedRecords: {},    // { name: { name, updatedAt, skills, appVersion } }
    mySharedName: null    // The name user has shared under
  }
};

// ============================================
// LOCAL STORAGE
// ============================================
const Storage = {
  keys: {
    skillXp: 'xpgains_skill_xp',
    favorites: 'xpgains_favorites',
    logEntries: 'xpgains_log_entries',
    settings: 'xpgains_settings',
    challenge: 'xpgains_challenge',
    lastExerciseInputs: 'xpgains_last_exercise_inputs',
    friends: 'xpgains_friends'
  },

  save() {
    try {
      localStorage.setItem(this.keys.skillXp, JSON.stringify(AppState.skillXp));
      localStorage.setItem(this.keys.favorites, JSON.stringify(AppState.favorites));
      localStorage.setItem(this.keys.logEntries, JSON.stringify(AppState.logEntries));
      localStorage.setItem(this.keys.settings, JSON.stringify(AppState.settings));
      localStorage.setItem(this.keys.challenge, JSON.stringify(AppState.challenge));
      localStorage.setItem(this.keys.lastExerciseInputs, JSON.stringify(AppState.lastExerciseInputs));
      localStorage.setItem(this.keys.friends, JSON.stringify(AppState.friends));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },

  load() {
    try {
      const skillXp = localStorage.getItem(this.keys.skillXp);
      const favorites = localStorage.getItem(this.keys.favorites);
      const logEntries = localStorage.getItem(this.keys.logEntries);
      const settings = localStorage.getItem(this.keys.settings);
      const challenge = localStorage.getItem(this.keys.challenge);
      const lastExerciseInputs = localStorage.getItem(this.keys.lastExerciseInputs);
      const friends = localStorage.getItem(this.keys.friends);

      if (skillXp) AppState.skillXp = JSON.parse(skillXp);
      if (favorites) AppState.favorites = JSON.parse(favorites);
      if (logEntries) AppState.logEntries = JSON.parse(logEntries);
      if (settings) AppState.settings = JSON.parse(settings);
      if (challenge) AppState.challenge = JSON.parse(challenge);
      if (lastExerciseInputs) AppState.lastExerciseInputs = JSON.parse(lastExerciseInputs);
      if (friends) AppState.friends = JSON.parse(friends);

      // Initialize any missing skills with 0 XP
      SKILLS.forEach(skill => {
        if (!(skill.id in AppState.skillXp)) {
          AppState.skillXp[skill.id] = 0;
        }
      });

      // Initialize friends structure if missing
      if (!AppState.friends.favorites) AppState.friends.favorites = {};
      if (!AppState.friends.sharedRecords) AppState.friends.sharedRecords = {};
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
  },

  reset() {
    if (confirm('Reset all XPGains data? This cannot be undone.')) {
      localStorage.removeItem(this.keys.skillXp);
      localStorage.removeItem(this.keys.favorites);
      localStorage.removeItem(this.keys.logEntries);
      localStorage.removeItem(this.keys.settings);
      localStorage.removeItem(this.keys.challenge);
      localStorage.removeItem(this.keys.lastExerciseInputs);
      localStorage.removeItem(this.keys.friends);
      location.reload();
    }
  }
};

// ============================================
// UNIT DISPLAY HELPERS
// ============================================
const Units = {
  // Convert weight for display based on current unit setting
  display(weightKg) {
    if (AppState.settings.unit === 'lbs') {
      return kgToLbs(weightKg);
    }
    return weightKg;
  },

  // Convert from display unit to KG for storage
  toKg(displayWeight) {
    if (AppState.settings.unit === 'lbs') {
      return lbsToKg(displayWeight);
    }
    return displayWeight;
  },

  // Get unit label
  label() {
    return AppState.settings.unit.toUpperCase();
  },

  // Convert exercise weight config for display
  convertConfig(config) {
    if (AppState.settings.unit === 'lbs') {
      return {
        min: Math.round(kgToLbs(config.min)),
        max: Math.round(kgToLbs(config.max)),
        step: config.step < 5 ? Math.round(kgToLbs(config.step) * 2) / 2 : Math.round(kgToLbs(config.step)),
        default: Math.round(kgToLbs(config.default))
      };
    }
    return config;
  }
};

// ============================================
// XP BAR COLOR INTERPOLATION
// ============================================
const XpBarColors = {
  // Color stops: 0% = red, 33% = orange, 66% = yellow, 100% = green
  stops: [
    { pct: 0,   color: { r: 255, g: 59, b: 48 } },   // #ff3b30 red
    { pct: 33,  color: { r: 255, g: 149, b: 0 } },   // #ff9500 orange
    { pct: 66,  color: { r: 255, g: 204, b: 0 } },   // #ffcc00 yellow
    { pct: 100, color: { r: 52, g: 199, b: 89 } }    // #34c759 green
  ],

  /**
   * Get interpolated color for a given percentage
   * @param {number} pct - Progress percentage (0-100)
   * @returns {string} RGB color string
   */
  getColor(pct) {
    pct = Math.max(0, Math.min(100, pct));

    // Find the two stops we're between
    let lower = this.stops[0];
    let upper = this.stops[this.stops.length - 1];

    for (let i = 0; i < this.stops.length - 1; i++) {
      if (pct >= this.stops[i].pct && pct <= this.stops[i + 1].pct) {
        lower = this.stops[i];
        upper = this.stops[i + 1];
        break;
      }
    }

    // Calculate position between the two stops
    const range = upper.pct - lower.pct;
    const rangePct = range === 0 ? 0 : (pct - lower.pct) / range;

    // Interpolate RGB values
    const r = Math.round(lower.color.r + rangePct * (upper.color.r - lower.color.r));
    const g = Math.round(lower.color.g + rangePct * (upper.color.g - lower.color.g));
    const b = Math.round(lower.color.b + rangePct * (upper.color.b - lower.color.b));

    return `rgb(${r}, ${g}, ${b})`;
  },

  /**
   * Get CSS gradient for the full bar (for background styling)
   * @returns {string} CSS linear-gradient
   */
  getGradient() {
    return 'linear-gradient(90deg, #ff3b30 0%, #ff9500 33%, #ffcc00 66%, #34c759 100%)';
  }
};

// ============================================
// NAVIGATION
// ============================================
const Navigation = {
  init() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        this.switchTab(targetTab);
      });
    });

    // Initialize with muscle-map as default
    this.switchTab('muscle-map');
  },

  switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(`${tabName}-screen`).classList.add('active');

    // Refresh content when switching tabs
    if (tabName === 'stats-card') {
      StatsCard.render();
    } else if (tabName === 'log') {
      LogScreen.render();
    } else if (tabName === 'muscle-map') {
      MuscleMap.render();
    } else if (tabName === 'challenges') {
      ChallengesScreen.render();
    } else if (tabName === 'friends') {
      FriendsScreen.render();
    } else if (tabName === 'settings') {
      SettingsScreen.render();
    }
  }
};

// ============================================
// STATS CARD SCREEN (formerly Skills)
// 5 rows x 3 columns grid layout
// ============================================
const StatsCard = {
  render() {
    const grid = document.getElementById('stats-grid');
    grid.innerHTML = '';

    // Render 14 skill tiles (fills 14 slots, leaving last slot for Total)
    SKILLS.forEach(skill => {
      const tile = this.createSkillTile(skill);
      grid.appendChild(tile);
    });

    // Render Total Level tile last (will be in position 15 = row 5, col 3 = bottom right)
    const totalLevel = getTotalLevel(AppState.skillXp);
    const totalTile = this.createTotalTile(totalLevel);
    grid.appendChild(totalTile);
  },

  createTotalTile(totalLevel) {
    const tile = document.createElement('div');
    tile.className = 'skill-tile total-tile';
    tile.innerHTML = `
      <div class="total-content">
        <span class="total-label">Total Level</span>
        <span class="total-value">${totalLevel}</span>
      </div>
    `;
    tile.title = 'Total Level';
    return tile;
  },

  createSkillTile(skill) {
    const xp = AppState.skillXp[skill.id] || 0;
    const level = levelFromXp(xp);
    const icon = this.getSkillIcon(skill.id, 64);

    const tile = document.createElement('div');
    tile.className = 'skill-tile';
    tile.innerHTML = `
      <div class="tile-content">
        <div class="tile-left">
          <div class="tile-icon">${icon}</div>
          <span class="tile-label">${skill.name}</span>
        </div>
        <div class="level-area">
          <span class="lvl-current">${level}</span>
          <span class="lvl-max">99</span>
        </div>
      </div>
    `;
    tile.title = skill.name;

    tile.addEventListener('click', () => {
      SkillDetail.show(skill.id);
    });

    return tile;
  },

  getSkillIcon(skillId, size = 48) {
    // Map skill IDs to icon filenames
    const iconMap = {
      chest: 'skill_chest',
      back_lats: 'skill_lats',
      back_erector: 'skill_erectors',
      traps: 'skill_traps',
      neck: 'skill_neck',
      delts: 'skill_delts',
      biceps: 'skill_biceps',
      triceps: 'skill_triceps',
      forearms: 'skill_forearms',
      core: 'skill_core',
      glutes: 'skill_glutes',
      quads: 'skill_quads',
      hamstrings: 'skill_hamstrings',
      calves: 'skill_calves'
    };
    const iconName = iconMap[skillId];
    if (iconName) {
      return `<img src="assets/Skill Card Icons/v9/XPGains/${size}/${iconName}.png" alt="${skillId}" class="skill-icon-img">`;
    }
    return '&#x2B50;';
  }
};

// ============================================
// SKILL DETAIL VIEW
// ============================================
const SkillDetail = {
  show(skillId) {
    const skill = getSkillById(skillId);
    if (!skill) return;

    const xp = AppState.skillXp[skillId] || 0;
    const level = levelFromXp(xp);
    const progress = progressToNextLevel(xp);
    const currentLevelXp = xpForLevel(level);
    const nextLevelXp = xpForLevel(level + 1);
    const xpIntoLevel = xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;

    const content = document.getElementById('skill-detail-content');
    content.innerHTML = `
      <div class="skill-detail">
        <div class="skill-detail-icon">${StatsCard.getSkillIcon(skillId, 128)}</div>
        <div class="skill-detail-name">${skill.name}</div>
        <div class="skill-detail-level">${level}</div>
        <div class="skill-detail-xp">
          <div class="skill-detail-xp-text">Experience</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
            <div class="progress-text">${progress}%</div>
          </div>
          <div class="skill-detail-xp-numbers">
            <span>${xp.toLocaleString()}</span> / ${nextLevelXp.toLocaleString()} XP
          </div>
        </div>
        ${level < 99 ? `
          <div class="skill-detail-xp-text">
            ${(xpNeeded - xpIntoLevel).toLocaleString()} XP to level ${level + 1}
          </div>
        ` : '<div class="skill-detail-xp-text">MAX LEVEL</div>'}
        <button class="xp-tick-btn skill-detail-train-btn" id="train-skill-btn">Train</button>
      </div>
    `;

    // Train button handler
    content.querySelector('#train-skill-btn').addEventListener('click', () => {
      Modal.hide('skill-detail-modal');
      TrainingFlow.start(skillId);
    });

    Modal.show('skill-detail-modal');
  }
};

// ============================================
// LOG SCREEN
// ============================================
const LogScreen = {
  render() {
    const container = document.getElementById('log-entries');

    if (AppState.logEntries.length === 0) {
      container.innerHTML = '<p class="empty-state">No training logged yet. Start training from the Muscle Map!</p>';
      return;
    }

    // Group entries by day
    const grouped = this.groupByDay(AppState.logEntries);
    container.innerHTML = '';

    // Render in reverse chronological order
    const days = Object.keys(grouped).sort().reverse();
    days.forEach(day => {
      const dayGroup = this.createDayGroup(day, grouped[day]);
      container.appendChild(dayGroup);
    });
  },

  groupByDay(entries) {
    const groups = {};
    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayKey = date.toISOString().split('T')[0];
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(entry);
    });
    return groups;
  },

  createDayGroup(dayKey, entries) {
    const group = document.createElement('div');
    group.className = 'log-day-group';

    const totalXp = entries.reduce((sum, e) => sum + e.xpAwarded, 0);
    const dateStr = new Date(dayKey).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    group.innerHTML = `
      <div class="log-day-header">
        <span class="log-day-date">${dateStr}</span>
        <span class="log-day-xp">+${totalXp.toLocaleString()} XP</span>
      </div>
    `;

    // Sort entries by timestamp descending within the day
    const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
    sorted.forEach((entry, index) => {
      const entryEl = this.createLogEntry(entry, sorted[index + 1]);
      group.appendChild(entryEl);
    });

    return group;
  },

  createLogEntry(entry, prevEntry) {
    const exercise = getExerciseById(entry.exerciseId);
    const skill = getSkillById(entry.skillId);
    const subcategory = getSubcategoryById(entry.subcategoryId);
    const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Check for progressive overload indicators
    let indicator = '';
    if (prevEntry && prevEntry.exerciseId === entry.exerciseId) {
      if (entry.weight > prevEntry.weight) {
        indicator = '<span class="log-entry-indicator indicator-up">Weight up</span>';
      } else if (entry.weight === prevEntry.weight && entry.reps > prevEntry.reps) {
        indicator = '<span class="log-entry-indicator indicator-up">Reps up</span>';
      }
    }

    // Display weight in current unit
    const displayWeight = Units.display(entry.weight);

    const el = document.createElement('div');
    el.className = 'log-entry';
    el.innerHTML = `
      <div class="log-entry-main">
        <div class="log-entry-exercise">${exercise ? exercise.name : 'Unknown'}</div>
        <div class="log-entry-details">
          ${skill ? skill.name : ''} &bull; ${subcategory ? subcategory.name : ''}
        </div>
        <div class="log-entry-details">
          ${displayWeight} ${Units.label()} &times; ${entry.reps} reps
        </div>
        <div class="log-entry-time">${time} ${indicator}</div>
      </div>
      <div class="log-entry-right">
        <div class="log-entry-xp">+${entry.xpAwarded}</div>
        <div class="log-entry-skill-label">${skill ? skill.name : ''}</div>
        <button class="log-undo-btn" data-entry-id="${entry.id}">Undo</button>
      </div>
    `;

    // Add undo click handler
    el.querySelector('.log-undo-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.undoEntry(entry);
    });

    return el;
  },

  /**
   * Undo a log entry - subtract XP and remove from log
   */
  undoEntry(entry) {
    if (!confirm(`Undo this set? This will subtract ${entry.xpAwarded} XP from ${getSkillById(entry.skillId)?.name || 'Unknown'}.`)) {
      return;
    }

    // Subtract XP from the skill
    const currentXp = AppState.skillXp[entry.skillId] || 0;
    AppState.skillXp[entry.skillId] = Math.max(0, currentXp - entry.xpAwarded);

    // Remove the log entry
    const index = AppState.logEntries.findIndex(e => e.id === entry.id);
    if (index !== -1) {
      AppState.logEntries.splice(index, 1);
    }

    // Save and re-render
    Storage.save();
    this.render();

    // Also refresh Stats Card
    StatsCard.render();
  }
};

// ============================================
// MUSCLE MAP
// ============================================
const MuscleMap = {
  render() {
    const container = document.getElementById('muscle-map-container');
    container.innerHTML = this.getSvg();

    // Add click handlers to muscle regions
    const regions = container.querySelectorAll('.muscle-region');
    regions.forEach(region => {
      region.addEventListener('click', () => {
        const skillId = region.dataset.skillId;
        TrainingFlow.start(skillId);
      });
    });
  },

  getSvg() {
    return `
      <svg class="muscle-map-svg" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
        <!-- Head (not clickable) -->
        <ellipse cx="100" cy="30" rx="25" ry="30" fill="#2d2d2d" stroke="#3d352a" stroke-width="2"/>

        <!-- Neck -->
        <rect class="muscle-region" data-skill-id="neck" x="88" y="55" width="24" height="20" rx="4">
          <title>Neck</title>
        </rect>

        <!-- Traps -->
        <path class="muscle-region" data-skill-id="traps" d="M 65 75 L 88 75 L 88 95 L 65 85 Z">
          <title>Traps</title>
        </path>
        <path class="muscle-region" data-skill-id="traps" d="M 135 75 L 112 75 L 112 95 L 135 85 Z">
          <title>Traps</title>
        </path>

        <!-- Delts (Shoulders) -->
        <ellipse class="muscle-region" data-skill-id="delts" cx="55" cy="90" rx="18" ry="15">
          <title>Delts</title>
        </ellipse>
        <ellipse class="muscle-region" data-skill-id="delts" cx="145" cy="90" rx="18" ry="15">
          <title>Delts</title>
        </ellipse>

        <!-- Chest -->
        <path class="muscle-region" data-skill-id="chest" d="M 65 95 Q 100 90 135 95 L 130 135 Q 100 140 70 135 Z">
          <title>Chest</title>
        </path>

        <!-- Biceps -->
        <ellipse class="muscle-region" data-skill-id="biceps" cx="45" cy="130" rx="12" ry="28">
          <title>Biceps</title>
        </ellipse>
        <ellipse class="muscle-region" data-skill-id="biceps" cx="155" cy="130" rx="12" ry="28">
          <title>Biceps</title>
        </ellipse>

        <!-- Triceps -->
        <ellipse class="muscle-region" data-skill-id="triceps" cx="38" cy="125" rx="8" ry="22">
          <title>Triceps</title>
        </ellipse>
        <ellipse class="muscle-region" data-skill-id="triceps" cx="162" cy="125" rx="8" ry="22">
          <title>Triceps</title>
        </ellipse>

        <!-- Core (Abs) -->
        <rect class="muscle-region" data-skill-id="core" x="75" y="140" width="50" height="60" rx="8">
          <title>Core</title>
        </rect>

        <!-- Back - Lats -->
        <path class="muscle-region" data-skill-id="back_lats" d="M 65 100 L 75 100 L 75 160 L 65 140 Z">
          <title>Back - Lats</title>
        </path>
        <path class="muscle-region" data-skill-id="back_lats" d="M 135 100 L 125 100 L 125 160 L 135 140 Z">
          <title>Back - Lats</title>
        </path>

        <!-- Back - Erector -->
        <path class="muscle-region" data-skill-id="back_erector" d="M 75 160 L 75 200 L 70 190 L 65 160 Z">
          <title>Back - Erector</title>
        </path>
        <path class="muscle-region" data-skill-id="back_erector" d="M 125 160 L 125 200 L 130 190 L 135 160 Z">
          <title>Back - Erector</title>
        </path>

        <!-- Forearms -->
        <ellipse class="muscle-region" data-skill-id="forearms" cx="40" cy="175" rx="10" ry="25">
          <title>Forearms</title>
        </ellipse>
        <ellipse class="muscle-region" data-skill-id="forearms" cx="160" cy="175" rx="10" ry="25">
          <title>Forearms</title>
        </ellipse>

        <!-- Glutes -->
        <ellipse class="muscle-region" data-skill-id="glutes" cx="85" cy="215" rx="18" ry="15">
          <title>Glutes</title>
        </ellipse>
        <ellipse class="muscle-region" data-skill-id="glutes" cx="115" cy="215" rx="18" ry="15">
          <title>Glutes</title>
        </ellipse>

        <!-- Quads -->
        <ellipse class="muscle-region" data-skill-id="quads" cx="80" cy="275" rx="20" ry="45">
          <title>Quads</title>
        </ellipse>
        <ellipse class="muscle-region" data-skill-id="quads" cx="120" cy="275" rx="20" ry="45">
          <title>Quads</title>
        </ellipse>

        <!-- Hamstrings -->
        <path class="muscle-region" data-skill-id="hamstrings" d="M 60 250 L 65 240 L 65 300 L 60 310 Z">
          <title>Hamstrings</title>
        </path>
        <path class="muscle-region" data-skill-id="hamstrings" d="M 140 250 L 135 240 L 135 300 L 140 310 Z">
          <title>Hamstrings</title>
        </path>

        <!-- Calves -->
        <ellipse class="muscle-region" data-skill-id="calves" cx="75" cy="355" rx="12" ry="30">
          <title>Calves</title>
        </ellipse>
        <ellipse class="muscle-region" data-skill-id="calves" cx="125" cy="355" rx="12" ry="30">
          <title>Calves</title>
        </ellipse>

        <!-- Feet (not clickable) -->
        <ellipse cx="75" cy="392" rx="15" ry="8" fill="#2d2d2d" stroke="#3d352a" stroke-width="2"/>
        <ellipse cx="125" cy="392" rx="15" ry="8" fill="#2d2d2d" stroke="#3d352a" stroke-width="2"/>
      </svg>
    `;
  }
};

// ============================================
// TRAINING FLOW
// Single screen with subgroup headers + exercises
// ============================================
const TrainingFlow = {
  start(skillId) {
    AppState.training = {
      skillId: skillId,
      subcategoryId: null,
      exerciseId: null
    };
    this.showExerciseList();
  },

  // New: Single screen with subgroup headers and exercises
  showExerciseList() {
    const skill = getSkillById(AppState.training.skillId);
    const subcategories = getSubcategoriesBySkill(AppState.training.skillId);

    const content = document.getElementById('training-flow-content');

    // Build exercise list grouped by subcategory
    let exerciseListHtml = '';
    subcategories.forEach(subcategory => {
      const exercises = getExercisesBySubcategory(subcategory.id);
      if (exercises.length === 0) return;

      // Sort favorites first
      const sorted = [...exercises].sort((a, b) => {
        const aFav = AppState.favorites[a.id] ? 1 : 0;
        const bFav = AppState.favorites[b.id] ? 1 : 0;
        return bFav - aFav;
      });

      exerciseListHtml += `
        <div class="exercise-group">
          <div class="exercise-group-header">${subcategory.name}</div>
          <div class="exercise-group-list">
            ${sorted.map(ex => `
              <div class="training-list-item${AppState.favorites[ex.id] ? ' favorite' : ''}"
                   data-exercise-id="${ex.id}" data-subcategory-id="${subcategory.id}">
                ${ex.name}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    content.innerHTML = `
      <div class="training-step">
        <div class="training-step-title">${skill.name}</div>
        <div class="training-muscle-name">Select an exercise</div>
        <div class="exercise-groups">
          ${exerciseListHtml}
        </div>
      </div>
    `;

    // Exercise selection
    content.querySelectorAll('[data-exercise-id]').forEach(item => {
      item.addEventListener('click', () => {
        AppState.training.exerciseId = item.dataset.exerciseId;
        AppState.training.subcategoryId = item.dataset.subcategoryId;
        this.showExerciseDetail();
      });
    });

    Modal.show('training-modal');
  },

  showExerciseDetail() {
    const exercise = getExerciseById(AppState.training.exerciseId);
    const subcategory = getSubcategoryById(AppState.training.subcategoryId);
    const skill = getSkillById(AppState.training.skillId);
    const isFavorite = AppState.favorites[exercise.id];

    // Get weight config converted for current unit
    const weightConfig = Units.convertConfig(exercise.weight);

    // Load last used values for this exercise, or use defaults
    const lastInputs = AppState.lastExerciseInputs[exercise.id];
    let defaultWeight = weightConfig.default;
    let defaultReps = 10;

    if (lastInputs) {
      // Convert stored weight (in KG) to display unit
      defaultWeight = Units.display(lastInputs.weight);
      defaultReps = lastInputs.reps;
    }

    // Calculate current XP progress for the skill
    const currentXp = AppState.skillXp[skill.id] || 0;
    const currentLevel = levelFromXp(currentXp);
    const progress = progressToNextLevel(currentXp);
    const progressColor = XpBarColors.getColor(progress);

    const content = document.getElementById('training-flow-content');
    content.innerHTML = `
      <button class="back-btn" id="back-to-exercises">&larr; Back</button>
      <div class="exercise-detail">
        <div class="exercise-detail-name">
          ${exercise.name}
          <button class="favorite-btn${isFavorite ? ' active' : ''}" id="toggle-favorite">
            ${isFavorite ? '&#x2605;' : '&#x2606;'}
          </button>
        </div>
        <div class="exercise-detail-subcategory">${skill.name} &bull; ${subcategory.name}</div>

        <div class="input-group">
          <label class="input-label">Weight (${Units.label()})</label>
          <div class="input-row">
            <input type="range" class="input-slider" id="weight-slider"
                   min="${weightConfig.min}" max="${weightConfig.max}"
                   value="${defaultWeight}" step="${weightConfig.step}">
            <input type="number" class="input-number" id="weight-input"
                   value="${defaultWeight}" min="0" max="${weightConfig.max * 2}">
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">Reps</label>
          <div class="input-row">
            <input type="range" class="input-slider" id="reps-slider" min="1" max="30" value="${defaultReps}">
            <input type="number" class="input-number" id="reps-input" value="${defaultReps}" min="1" max="100">
          </div>
        </div>

        <p class="exercise-helper-text">Complete a set, then press XP Tick to log it.</p>

        <button class="xp-tick-btn" id="xp-tick-btn">XP Tick</button>

        <div class="exercise-xp-bar">
          <div class="exercise-xp-bar-label">
            <span>${skill.name} Lv. ${currentLevel}</span>
            <span>${progress}%</span>
          </div>
          <div class="exercise-xp-bar-track">
            <div class="exercise-xp-bar-fill" id="exercise-xp-fill" style="width: ${progress}%; background: ${progressColor};"></div>
          </div>
        </div>
      </div>
    `;

    // Sync sliders with inputs
    const weightSlider = content.querySelector('#weight-slider');
    const weightInput = content.querySelector('#weight-input');
    const repsSlider = content.querySelector('#reps-slider');
    const repsInput = content.querySelector('#reps-input');

    weightSlider.addEventListener('input', () => {
      weightInput.value = weightSlider.value;
    });
    weightInput.addEventListener('input', () => {
      weightSlider.value = Math.min(weightInput.value, weightConfig.max);
    });
    repsSlider.addEventListener('input', () => {
      repsInput.value = repsSlider.value;
    });
    repsInput.addEventListener('input', () => {
      repsSlider.value = Math.min(repsInput.value, 30);
    });

    // Back button
    content.querySelector('#back-to-exercises').addEventListener('click', () => {
      this.showExerciseList();
    });

    // Favorite toggle
    content.querySelector('#toggle-favorite').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      if (AppState.favorites[exercise.id]) {
        delete AppState.favorites[exercise.id];
        btn.classList.remove('active');
        btn.innerHTML = '&#x2606;';
      } else {
        AppState.favorites[exercise.id] = true;
        btn.classList.add('active');
        btn.innerHTML = '&#x2605;';
      }
      Storage.save();
    });

    // XP TICK - THE CRITICAL ACTION
    content.querySelector('#xp-tick-btn').addEventListener('click', () => {
      const displayWeight = parseFloat(weightInput.value) || 0;
      const weightKg = Units.toKg(displayWeight); // Convert to KG for storage
      const reps = parseInt(repsInput.value) || 1;
      this.performXpTick(weightKg, reps);
    });
  },

  performXpTick(weight, reps) {
    const { skillId, subcategoryId, exerciseId } = AppState.training;
    const currentXp = AppState.skillXp[skillId] || 0;
    const currentLevel = levelFromXp(currentXp);

    // Check if muscle is neglected for bonus XP
    const neglected = isSkillNeglected(skillId, AppState.logEntries);

    // Calculate XP gain with new formula
    const xpGained = calculateXpGain(reps, weight, exerciseId, currentLevel, AppState.recentSets, neglected);

    // CRITICAL INVARIANT: Every XP tick must:
    // 1. Award XP to exactly one parent muscle skill
    AppState.skillXp[skillId] = currentXp + xpGained;

    // 2. Create one complete log entry
    const logEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      skillId: skillId,
      subcategoryId: subcategoryId,
      exerciseId: exerciseId,
      weight: weight, // Stored in KG
      reps: reps,
      xpAwarded: xpGained
    };
    AppState.logEntries.push(logEntry);

    // Track for diminishing returns
    AppState.recentSets.push({
      exerciseId: exerciseId,
      weight: weight,
      reps: reps,
      timestamp: Date.now()
    });

    // Keep only recent sets (last 50)
    if (AppState.recentSets.length > 50) {
      AppState.recentSets = AppState.recentSets.slice(-50);
    }

    // Save last used inputs for this exercise
    AppState.lastExerciseInputs[exerciseId] = {
      weight: weight, // Stored in KG
      reps: reps,
      updatedAt: new Date().toISOString()
    };

    // Update challenge progress if active
    if (AppState.challenge) {
      ChallengesScreen.updateProgress(skillId, exerciseId);
    }

    // Save to localStorage
    Storage.save();

    // Show XP toast
    this.showXpToast(xpGained, neglected);

    // Update the XP bar in exercise detail immediately
    this.updateExerciseXpBar(skillId);

    // Refresh Stats Card if visible (or prepare for when user returns)
    StatsCard.render();

    // Check for level up
    const newLevel = levelFromXp(AppState.skillXp[skillId]);
    if (newLevel > currentLevel) {
      setTimeout(() => {
        alert(`Level up! ${getSkillById(skillId).name} is now level ${newLevel}!`);
      }, 500);
    }
  },

  /**
   * Update the XP bar in the exercise detail view
   */
  updateExerciseXpBar(skillId) {
    const skill = getSkillById(skillId);
    const currentXp = AppState.skillXp[skillId] || 0;
    const currentLevel = levelFromXp(currentXp);
    const progress = progressToNextLevel(currentXp);
    const progressColor = XpBarColors.getColor(progress);

    const fill = document.getElementById('exercise-xp-fill');
    const label = document.querySelector('.exercise-xp-bar-label');

    if (fill) {
      fill.style.width = `${progress}%`;
      fill.style.background = progressColor;
    }
    if (label) {
      label.innerHTML = `<span>${skill.name} Lv. ${currentLevel}</span><span>${progress}%</span>`;
    }
  },

  showXpToast(xp, neglected = false) {
    const toast = document.getElementById('xp-toast');
    // Always show plain XP text - neglected bonus is awarded silently
    toast.querySelector('.xp-toast-text').textContent = `+${xp} XP`;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 1500);
  }
};

// ============================================
// CHALLENGES SCREEN
// ============================================
const ChallengesScreen = {
  render() {
    const container = document.getElementById('challenges-content');

    // If challenge is active, show progress
    if (AppState.challenge && !AppState.challenge.completed) {
      this.renderActiveChallenge(container);
      return;
    }

    // Show challenge creation form
    container.innerHTML = `
      <div class="challenge-setup">
        <h3 class="challenge-title">Workout Quest</h3>

        <div class="challenge-option">
          <label class="input-label">Body Focus</label>
          <div class="toggle-group" id="focus-toggle">
            <button class="toggle-btn active" data-value="random">Full Random</button>
            <button class="toggle-btn" data-value="upper">Upper Body</button>
            <button class="toggle-btn" data-value="lower">Lower Body</button>
          </div>
        </div>

        <div class="challenge-option">
          <label class="input-label">Workout Length</label>
          <div class="toggle-group" id="length-toggle">
            <button class="toggle-btn" data-value="short">Short</button>
            <button class="toggle-btn active" data-value="regular">Regular</button>
            <button class="toggle-btn" data-value="ironman">Ironman</button>
          </div>
          <div class="challenge-length-desc" id="length-desc">
            2 muscles, 3 exercises each, 3-4 sets per exercise
          </div>
        </div>

        <button class="xp-tick-btn challenge-start-btn" id="start-challenge">
          Start Workout Challenge
        </button>
      </div>
    `;

    // Toggle handlers
    this.setupToggleGroup('focus-toggle');
    this.setupToggleGroup('length-toggle', () => this.updateLengthDesc());

    // Start button
    container.querySelector('#start-challenge').addEventListener('click', () => {
      this.startChallenge();
    });
  },

  setupToggleGroup(groupId, onChange = null) {
    const group = document.getElementById(groupId);
    group.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (onChange) onChange();
      });
    });
  },

  updateLengthDesc() {
    const length = document.querySelector('#length-toggle .toggle-btn.active').dataset.value;
    const desc = document.getElementById('length-desc');
    const descriptions = {
      short: '1 muscle, 1 exercise, 4 sets',
      regular: '2 muscles, 3 exercises each, 3-4 sets per exercise',
      ironman: '3 muscles, 4 exercises each, 4 sets per exercise'
    };
    desc.textContent = descriptions[length];
  },

  startChallenge() {
    const focus = document.querySelector('#focus-toggle .toggle-btn.active').dataset.value;
    const length = document.querySelector('#length-toggle .toggle-btn.active').dataset.value;

    // Challenge configuration
    const config = {
      short: { muscles: 1, exercises: 1, sets: 4 },
      regular: { muscles: 2, exercises: 3, sets: 4 },
      ironman: { muscles: 3, exercises: 4, sets: 4 }
    }[length];

    // Get random muscles based on focus
    let region = null;
    if (focus === 'upper') region = 'upper';
    else if (focus === 'lower') region = 'lower';

    const selectedSkills = getRandomSkills(config.muscles, region);

    // Build challenge structure
    const challenge = {
      id: Date.now().toString(),
      startedAt: Date.now(),
      focus: focus,
      length: length,
      completed: false,
      muscles: selectedSkills.map(skill => ({
        skillId: skill.id,
        skillName: skill.name,
        exercises: getRandomExercises(skill.id, config.exercises).map(ex => ({
          exerciseId: ex.id,
          exerciseName: ex.name,
          targetSets: config.sets,
          completedSets: 0
        }))
      }))
    };

    AppState.challenge = challenge;
    Storage.save();
    this.render();
  },

  renderActiveChallenge(container) {
    const challenge = AppState.challenge;

    let musclesHtml = '';
    let totalSets = 0;
    let completedSets = 0;

    challenge.muscles.forEach(muscle => {
      let exercisesHtml = '';
      muscle.exercises.forEach(ex => {
        totalSets += ex.targetSets;
        completedSets += ex.completedSets;
        const done = ex.completedSets >= ex.targetSets;
        exercisesHtml += `
          <div class="challenge-exercise ${done ? 'completed' : ''}">
            <span class="challenge-exercise-name">${ex.exerciseName}</span>
            <span class="challenge-exercise-progress">${ex.completedSets}/${ex.targetSets}</span>
          </div>
        `;
      });

      musclesHtml += `
        <div class="challenge-muscle">
          <div class="challenge-muscle-header">${muscle.skillName}</div>
          <div class="challenge-exercises">
            ${exercisesHtml}
          </div>
        </div>
      `;
    });

    const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    container.innerHTML = `
      <div class="challenge-active">
        <h3 class="challenge-title">Active Quest</h3>
        <div class="challenge-progress-bar">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
            <div class="progress-text">${progress}%</div>
          </div>
        </div>
        <div class="challenge-info">
          ${completedSets} / ${totalSets} sets completed
        </div>
        <div class="challenge-muscles">
          ${musclesHtml}
        </div>
        <div class="challenge-actions">
          <button class="back-btn" id="abandon-challenge">Abandon Quest</button>
          ${progress >= 100 ? '<button class="xp-tick-btn" id="complete-challenge">Complete Quest!</button>' : ''}
        </div>
      </div>
    `;

    // Abandon button
    container.querySelector('#abandon-challenge')?.addEventListener('click', () => {
      if (confirm('Abandon this quest? Progress will be lost.')) {
        AppState.challenge = null;
        Storage.save();
        this.render();
      }
    });

    // Complete button
    container.querySelector('#complete-challenge')?.addEventListener('click', () => {
      AppState.challenge.completed = true;
      Storage.save();
      alert('Quest completed! Great workout!');
      AppState.challenge = null;
      Storage.save();
      this.render();
    });
  },

  updateProgress(skillId, exerciseId) {
    if (!AppState.challenge) return;

    const muscle = AppState.challenge.muscles.find(m => m.skillId === skillId);
    if (!muscle) return;

    const exercise = muscle.exercises.find(e => e.exerciseId === exerciseId);
    if (exercise && exercise.completedSets < exercise.targetSets) {
      exercise.completedSets++;
      Storage.save();
    }
  }
};

// ============================================
// SETTINGS SCREEN
// ============================================
const SettingsScreen = {
  render() {
    const container = document.getElementById('settings-content');
    container.innerHTML = `
      <div class="settings-section">
        <h3 class="settings-title">Units</h3>
        <div class="settings-option">
          <label class="input-label">Weight Unit</label>
          <div class="toggle-group" id="unit-toggle">
            <button class="toggle-btn${AppState.settings.unit === 'kg' ? ' active' : ''}" data-value="kg">KG</button>
            <button class="toggle-btn${AppState.settings.unit === 'lbs' ? ' active' : ''}" data-value="lbs">LBS</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">Calibration</h3>
        <div class="settings-option">
          <button class="back-btn calibrate-btn" id="calibrate-skills">Calibrate Skills</button>
          <p class="settings-info">Manually set skill levels if you're migrating from another tracker.</p>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">Data</h3>
        <div class="settings-option">
          <button class="back-btn danger-btn" id="reset-data">Reset All Data</button>
          <p class="settings-warning">This will delete all your progress and cannot be undone.</p>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">About</h3>
        <p class="settings-info">XPGains v0.3 - Train your skills!</p>
      </div>
    `;

    // Unit toggle
    const unitGroup = container.querySelector('#unit-toggle');
    unitGroup.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        unitGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.settings.unit = btn.dataset.value;
        Storage.save();
      });
    });

    // Calibrate skills button
    container.querySelector('#calibrate-skills').addEventListener('click', () => {
      CalibrationModal.show();
    });

    // Reset button
    container.querySelector('#reset-data').addEventListener('click', () => {
      Storage.reset();
    });
  }
};

// ============================================
// CALIBRATION MODAL
// ============================================
const CalibrationModal = {
  show() {
    const content = document.getElementById('calibration-content');

    // Build skill rows
    let skillRowsHtml = '';
    SKILLS.forEach(skill => {
      const currentXp = AppState.skillXp[skill.id] || 0;
      const currentLevel = levelFromXp(currentXp);

      skillRowsHtml += `
        <div class="calibration-row">
          <div class="calibration-skill-info">
            ${StatsCard.getSkillIcon(skill.id, 32)}
            <span class="calibration-skill-name">${skill.name}</span>
          </div>
          <input type="number" class="calibration-level-input"
                 data-skill-id="${skill.id}"
                 value="${currentLevel}"
                 min="1" max="99">
        </div>
      `;
    });

    content.innerHTML = `
      <div class="calibration-modal">
        <h3 class="calibration-title">Calibrate Skills</h3>
        <p class="calibration-desc">Set skill levels manually. XP will be set to the minimum for each level.</p>

        <div class="calibration-skills-list">
          ${skillRowsHtml}
        </div>

        <div class="calibration-actions">
          <button class="back-btn" id="calibration-cancel">Cancel</button>
          <button class="xp-tick-btn calibration-save-btn" id="calibration-save">Save</button>
        </div>
      </div>
    `;

    // Cancel button
    content.querySelector('#calibration-cancel').addEventListener('click', () => {
      Modal.hide('calibration-modal');
    });

    // Save button
    content.querySelector('#calibration-save').addEventListener('click', () => {
      this.save();
    });

    // Clamp inputs on change
    content.querySelectorAll('.calibration-level-input').forEach(input => {
      input.addEventListener('change', () => {
        let val = parseInt(input.value) || 1;
        val = Math.max(1, Math.min(99, val));
        input.value = val;
      });
    });

    Modal.show('calibration-modal');
  },

  save() {
    const inputs = document.querySelectorAll('.calibration-level-input');

    inputs.forEach(input => {
      const skillId = input.dataset.skillId;
      let level = parseInt(input.value) || 1;
      level = Math.max(1, Math.min(99, level));

      // Set XP to the minimum for that level
      AppState.skillXp[skillId] = xpForLevel(level);
    });

    // Save and refresh
    Storage.save();
    StatsCard.render();
    Modal.hide('calibration-modal');
  }
};

// ============================================
// FRIENDS SCREEN
// ============================================
const FriendsScreen = {
  currentPage: 0,
  itemsPerPage: 25,
  searchQuery: '',

  render() {
    const container = document.getElementById('friends-content');

    container.innerHTML = `
      <div class="friends-top-area">
        <div class="friends-search-row">
          <input type="text" class="friends-search-input" id="friends-search"
                 placeholder="Search by name..." value="${this.searchQuery}">
          <button class="xp-tick-btn friends-share-btn" id="share-progress">Share Progress</button>
        </div>
      </div>

      <div class="friends-list-area" id="friends-list">
        <!-- Friends list rendered here -->
      </div>

      <div class="friends-pagination" id="friends-pagination">
        <!-- Pagination controls -->
      </div>
    `;

    // Search input handler
    container.querySelector('#friends-search').addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.currentPage = 0;
      this.renderList();
    });

    // Share progress button
    container.querySelector('#share-progress').addEventListener('click', () => {
      this.showShareDialog();
    });

    this.renderList();
  },

  renderList() {
    const listContainer = document.getElementById('friends-list');
    const paginationContainer = document.getElementById('friends-pagination');

    // Get all friend records
    let friends = Object.values(AppState.friends.sharedRecords);

    // Filter by search
    if (this.searchQuery) {
      friends = friends.filter(f =>
        f.name.toLowerCase().includes(this.searchQuery)
      );
    }

    // Sort: favorites first (in green), then alphabetically
    friends.sort((a, b) => {
      const aFav = AppState.friends.favorites[a.name] ? 1 : 0;
      const bFav = AppState.friends.favorites[b.name] ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return a.name.localeCompare(b.name);
    });

    // Pagination
    const totalPages = Math.ceil(friends.length / this.itemsPerPage);
    const startIdx = this.currentPage * this.itemsPerPage;
    const endIdx = startIdx + this.itemsPerPage;
    const pageFriends = friends.slice(startIdx, endIdx);

    if (friends.length === 0) {
      listContainer.innerHTML = `
        <div class="friends-empty-state">
          <p>No friends found.</p>
          <p>Share your progress or add friends to get started!</p>
        </div>
      `;
      paginationContainer.innerHTML = '';
      return;
    }

    // Render friend rows
    let listHtml = '';
    pageFriends.forEach(friend => {
      const isFavorite = AppState.friends.favorites[friend.name];
      const totalLevel = this.calculateTotalLevel(friend.skills);
      const updatedDate = friend.updatedAt
        ? new Date(friend.updatedAt).toLocaleDateString()
        : 'Unknown';

      listHtml += `
        <div class="friend-row ${isFavorite ? 'favorite' : ''}" data-name="${friend.name}">
          <button class="friend-star-btn ${isFavorite ? 'active' : ''}" data-name="${friend.name}">
            ${isFavorite ? '&#x2605;' : '&#x2606;'}
          </button>
          <div class="friend-info" data-name="${friend.name}">
            <span class="friend-name">${friend.name}</span>
            <span class="friend-meta">Total Lv. ${totalLevel} &bull; ${updatedDate}</span>
          </div>
        </div>
      `;
    });
    listContainer.innerHTML = listHtml;

    // Add click handlers for star buttons
    listContainer.querySelectorAll('.friend-star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.name;
        this.toggleFavorite(name);
      });
    });

    // Add click handlers for viewing friend
    listContainer.querySelectorAll('.friend-info').forEach(info => {
      info.addEventListener('click', () => {
        const name = info.dataset.name;
        this.viewFriend(name);
      });
    });

    // Render pagination
    if (totalPages > 1) {
      paginationContainer.innerHTML = `
        <button class="back-btn" id="friends-prev" ${this.currentPage === 0 ? 'disabled' : ''}>Prev</button>
        <span class="friends-page-info">Page ${this.currentPage + 1} of ${totalPages}</span>
        <button class="back-btn" id="friends-next" ${this.currentPage >= totalPages - 1 ? 'disabled' : ''}>Next</button>
      `;

      paginationContainer.querySelector('#friends-prev')?.addEventListener('click', () => {
        if (this.currentPage > 0) {
          this.currentPage--;
          this.renderList();
        }
      });

      paginationContainer.querySelector('#friends-next')?.addEventListener('click', () => {
        if (this.currentPage < totalPages - 1) {
          this.currentPage++;
          this.renderList();
        }
      });
    } else {
      paginationContainer.innerHTML = '';
    }
  },

  toggleFavorite(name) {
    if (AppState.friends.favorites[name]) {
      delete AppState.friends.favorites[name];
    } else {
      AppState.friends.favorites[name] = true;
    }
    Storage.save();
    this.renderList();
  },

  calculateTotalLevel(skills) {
    if (!skills) return 14; // Default level 1 for all
    let total = 0;
    SKILLS.forEach(skill => {
      if (skills[skill.id]) {
        total += skills[skill.id].level || 1;
      } else {
        total += 1;
      }
    });
    return total;
  },

  showShareDialog() {
    const currentName = AppState.friends.mySharedName || '';
    const name = prompt('Enter a name to share your progress under:', currentName);

    if (name === null) return; // Cancelled
    if (!name.trim()) {
      alert('Please enter a valid name.');
      return;
    }

    const sanitizedName = name.trim();

    // Build the shared record
    const record = {
      name: sanitizedName,
      updatedAt: new Date().toISOString(),
      skills: {},
      appVersion: '0.3'
    };

    SKILLS.forEach(skill => {
      const xp = AppState.skillXp[skill.id] || 0;
      const level = levelFromXp(xp);
      record.skills[skill.id] = { level, xp };
    });

    // Save to local shared records (this user's own record)
    AppState.friends.sharedRecords[sanitizedName] = record;
    AppState.friends.mySharedName = sanitizedName;
    Storage.save();

    // Generate JSON for potential Git sync
    this.generateExportJson(record);

    alert(`Your progress has been saved under "${sanitizedName}".`);
    this.renderList();
  },

  generateExportJson(record) {
    // This creates a JSON blob that could be pushed to Git
    // For now, we'll store it and log it for future integration
    const json = JSON.stringify(record, null, 2);
    console.log('Shared record JSON (for Git sync):', json);

    // Store in localStorage for potential manual export
    try {
      localStorage.setItem('xpgains_my_shared_json', json);
    } catch (e) {
      console.error('Failed to store export JSON:', e);
    }
  },

  viewFriend(name) {
    const friend = AppState.friends.sharedRecords[name];
    if (!friend) {
      alert('Friend data not found.');
      return;
    }

    const content = document.getElementById('friend-view-content');

    // Build stats grid using friend's data
    let gridHtml = '';
    SKILLS.forEach(skill => {
      const skillData = friend.skills[skill.id] || { level: 1, xp: 0 };
      const icon = StatsCard.getSkillIcon(skill.id, 64);

      gridHtml += `
        <div class="skill-tile">
          <div class="tile-content">
            <div class="tile-left">
              <div class="tile-icon">${icon}</div>
              <span class="tile-label">${skill.name}</span>
            </div>
            <div class="level-area">
              <span class="lvl-current">${skillData.level}</span>
              <span class="lvl-max">99</span>
            </div>
          </div>
        </div>
      `;
    });

    // Add total level tile
    const totalLevel = this.calculateTotalLevel(friend.skills);
    gridHtml += `
      <div class="skill-tile total-tile">
        <div class="total-content">
          <span class="total-label">Total Level</span>
          <span class="total-value">${totalLevel}</span>
        </div>
      </div>
    `;

    content.innerHTML = `
      <div class="friend-view-header">
        <h3>Viewing: ${friend.name}</h3>
        <p class="friend-view-meta">Last updated: ${new Date(friend.updatedAt).toLocaleString()}</p>
      </div>
      <div class="stats-grid-wrapper friend-stats-wrapper">
        <div class="stats-grid">
          ${gridHtml}
        </div>
      </div>
    `;

    Modal.show('friend-view-modal');
  },

  /**
   * Fetch friend data from remote (Git/URL)
   * Prepared for future integration - currently logs and returns local data
   */
  async fetchFromRemote(name) {
    // This is prepared for Git integration
    // When connected, this would fetch from:
    // https://raw.githubusercontent.com/<repo>/main/friends/<name>.json

    console.log(`[Friends] Would fetch remote data for: ${name}`);

    // For now, return local data
    return AppState.friends.sharedRecords[name] || null;
  },

  /**
   * Sync all friends from remote index
   * Prepared for future integration
   */
  async syncFromRemote() {
    // This would fetch friends/index.json from the Git repo
    // and update local sharedRecords

    console.log('[Friends] Remote sync not yet configured. Using local data.');

    // Future implementation:
    // const indexUrl = 'https://raw.githubusercontent.com/<repo>/main/friends/index.json';
    // const response = await fetch(indexUrl);
    // const index = await response.json();
    // for (const name of index.names) {
    //   const recordUrl = `https://raw.githubusercontent.com/<repo>/main/friends/${name}.json`;
    //   const record = await fetch(recordUrl).then(r => r.json());
    //   AppState.friends.sharedRecords[name] = record;
    // }
    // Storage.save();
  }
};

// ============================================
// MODAL SYSTEM
// ============================================
const Modal = {
  show(modalId) {
    document.getElementById(modalId).classList.add('active');
  },

  hide(modalId) {
    document.getElementById(modalId).classList.remove('active');
  },

  init() {
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal').classList.remove('active');
      });
    });

    // Click outside to close
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Load saved data
  Storage.load();

  // Initialize components
  Modal.init();
  Navigation.init();

  // Expose reset function globally for testing
  window.resetXPGains = Storage.reset.bind(Storage);

  console.log('XPGains v0.3 initialized. Use resetXPGains() to clear all data.');
});
