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
  challenge: null
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
    challenge: 'xpgains_challenge'
  },

  save() {
    try {
      localStorage.setItem(this.keys.skillXp, JSON.stringify(AppState.skillXp));
      localStorage.setItem(this.keys.favorites, JSON.stringify(AppState.favorites));
      localStorage.setItem(this.keys.logEntries, JSON.stringify(AppState.logEntries));
      localStorage.setItem(this.keys.settings, JSON.stringify(AppState.settings));
      localStorage.setItem(this.keys.challenge, JSON.stringify(AppState.challenge));
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

      if (skillXp) AppState.skillXp = JSON.parse(skillXp);
      if (favorites) AppState.favorites = JSON.parse(favorites);
      if (logEntries) AppState.logEntries = JSON.parse(logEntries);
      if (settings) AppState.settings = JSON.parse(settings);
      if (challenge) AppState.challenge = JSON.parse(challenge);

      // Initialize any missing skills with 0 XP
      SKILLS.forEach(skill => {
        if (!(skill.id in AppState.skillXp)) {
          AppState.skillXp[skill.id] = 0;
        }
      });
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
        <button class="xp-tick-btn skill-detail-train-btn" id="train-skill-btn">Train ${skill.name}</button>
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
      </div>
    `;

    return el;
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
                   value="${weightConfig.default}" step="${weightConfig.step}">
            <input type="number" class="input-number" id="weight-input"
                   value="${weightConfig.default}" min="0" max="${weightConfig.max * 2}">
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">Reps</label>
          <div class="input-row">
            <input type="range" class="input-slider" id="reps-slider" min="1" max="30" value="10">
            <input type="number" class="input-number" id="reps-input" value="10" min="1" max="100">
          </div>
        </div>

        <button class="xp-tick-btn" id="xp-tick-btn">XP Tick</button>
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

    // Update challenge progress if active
    if (AppState.challenge) {
      ChallengesScreen.updateProgress(skillId, exerciseId);
    }

    // Save to localStorage
    Storage.save();

    // Show XP toast
    this.showXpToast(xpGained, neglected);

    // Check for level up
    const newLevel = levelFromXp(AppState.skillXp[skillId]);
    if (newLevel > currentLevel) {
      setTimeout(() => {
        alert(`Level up! ${getSkillById(skillId).name} is now level ${newLevel}!`);
      }, 500);
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
        <h3 class="settings-title">Data</h3>
        <div class="settings-option">
          <button class="back-btn danger-btn" id="reset-data">Reset All Data</button>
          <p class="settings-warning">This will delete all your progress and cannot be undone.</p>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">About</h3>
        <p class="settings-info">XPGains v0.2 - Train your skills!</p>
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

    // Reset button
    container.querySelector('#reset-data').addEventListener('click', () => {
      Storage.reset();
    });
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

  console.log('XPGains v0.2 initialized. Use resetXPGains() to clear all data.');
});
