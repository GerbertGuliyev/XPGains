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

  // Set history - detailed record of every set logged
  setHistory: [],

  // Recent sets for diminishing XP calculation (per session)
  recentSets: [],

  // Settings
  settings: {
    unit: 'kg', // 'kg' or 'lbs'
    theme: 'classic', // 'classic' or 'alt'
    lang: 'en' // Language code
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
  },

  // Training plans
  trainingPlans: [],

  // Custom exercises
  customExercises: [],

  // Equipment settings
  equipmentMode: false,
  equipment: ['bodyweight'] // Default to bodyweight only
};

// ============================================
// LOCAL STORAGE
// ============================================
const Storage = {
  keys: {
    skillXp: 'xpgains_skill_xp',
    favorites: 'xpgains_favorites',
    logEntries: 'xpgains_log_entries',
    setHistory: 'xpgains_set_history',
    settings: 'xpgains_settings',
    challenge: 'xpgains_challenge',
    lastExerciseInputs: 'xpgains_last_exercise_inputs',
    friends: 'xpgains_friends',
    trainingPlans: 'xpgains_training_plans',
    customExercises: 'xpgains_custom_exercises',
    equipmentMode: 'xpgains_equipment_mode',
    equipment: 'xpgains_equipment',
    lang: 'xpgains_lang',
    theme: 'xpgains_theme',
    introDismissed: 'xpgains_intro_dismissed'
  },

  save() {
    try {
      localStorage.setItem(this.keys.skillXp, JSON.stringify(AppState.skillXp));
      localStorage.setItem(this.keys.favorites, JSON.stringify(AppState.favorites));
      localStorage.setItem(this.keys.logEntries, JSON.stringify(AppState.logEntries));
      localStorage.setItem(this.keys.setHistory, JSON.stringify(AppState.setHistory));
      localStorage.setItem(this.keys.settings, JSON.stringify(AppState.settings));
      localStorage.setItem(this.keys.challenge, JSON.stringify(AppState.challenge));
      localStorage.setItem(this.keys.lastExerciseInputs, JSON.stringify(AppState.lastExerciseInputs));
      localStorage.setItem(this.keys.friends, JSON.stringify(AppState.friends));
      localStorage.setItem(this.keys.trainingPlans, JSON.stringify(AppState.trainingPlans));
      localStorage.setItem(this.keys.customExercises, JSON.stringify(AppState.customExercises));
      localStorage.setItem(this.keys.equipmentMode, AppState.equipmentMode ? '1' : '0');
      localStorage.setItem(this.keys.equipment, JSON.stringify(AppState.equipment));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },

  load() {
    try {
      const skillXp = localStorage.getItem(this.keys.skillXp);
      const favorites = localStorage.getItem(this.keys.favorites);
      const logEntries = localStorage.getItem(this.keys.logEntries);
      const setHistory = localStorage.getItem(this.keys.setHistory);
      const settings = localStorage.getItem(this.keys.settings);
      const challenge = localStorage.getItem(this.keys.challenge);
      const lastExerciseInputs = localStorage.getItem(this.keys.lastExerciseInputs);
      const friends = localStorage.getItem(this.keys.friends);
      const trainingPlans = localStorage.getItem(this.keys.trainingPlans);
      const customExercises = localStorage.getItem(this.keys.customExercises);
      const equipmentMode = localStorage.getItem(this.keys.equipmentMode);
      const equipment = localStorage.getItem(this.keys.equipment);
      const lang = localStorage.getItem(this.keys.lang);
      const theme = localStorage.getItem(this.keys.theme);

      if (skillXp) AppState.skillXp = JSON.parse(skillXp);
      if (favorites) AppState.favorites = JSON.parse(favorites);
      if (logEntries) AppState.logEntries = JSON.parse(logEntries);
      if (setHistory) AppState.setHistory = JSON.parse(setHistory);
      if (settings) AppState.settings = JSON.parse(settings);
      if (challenge) AppState.challenge = JSON.parse(challenge);
      if (lastExerciseInputs) AppState.lastExerciseInputs = JSON.parse(lastExerciseInputs);
      if (friends) AppState.friends = JSON.parse(friends);
      if (trainingPlans) AppState.trainingPlans = JSON.parse(trainingPlans);
      if (customExercises) AppState.customExercises = JSON.parse(customExercises);
      if (equipmentMode) AppState.equipmentMode = equipmentMode === '1';
      if (equipment) AppState.equipment = JSON.parse(equipment);
      if (lang) AppState.settings.lang = lang;
      if (theme) AppState.settings.theme = theme;

      // Initialize any missing skills with 0 XP
      SKILLS.forEach(skill => {
        if (!(skill.id in AppState.skillXp)) {
          AppState.skillXp[skill.id] = 0;
        }
      });

      // Initialize friends structure if missing
      if (!AppState.friends.favorites) AppState.friends.favorites = {};
      if (!AppState.friends.sharedRecords) AppState.friends.sharedRecords = {};

      // Initialize settings defaults if missing
      if (!AppState.settings.theme) AppState.settings.theme = 'classic';
      if (!AppState.settings.lang) AppState.settings.lang = 'en';
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
  },

  reset() {
    if (confirm(i18n.t('settings.reset_confirm'))) {
      Object.values(this.keys).forEach(key => {
        localStorage.removeItem(key);
      });
      location.reload();
    }
  }
};

// ============================================
// INTERNATIONALIZATION (i18n)
// ============================================
const i18n = {
  currentLang: 'en',

  /**
   * Detect user's browser/OS language
   * @returns {string} Language code or 'en' if not supported
   */
  detectLanguage() {
    if (typeof I18N === 'undefined') return 'en';

    // Get browser language (e.g., 'en-US', 'de', 'fr-FR')
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    // Extract base language code (e.g., 'en' from 'en-US')
    const baseLang = browserLang.split('-')[0].toLowerCase();

    // Check if we support this language
    const supported = I18N.languages.find(l => l.code === baseLang);
    return supported ? baseLang : 'en';
  },

  /**
   * Initialize i18n system
   */
  init() {
    // Check if I18N is loaded
    if (typeof I18N === 'undefined') {
      console.error('I18N translations not loaded!');
      return;
    }

    // Use saved language, or detect from OS, fallback to 'en'
    const savedLang = localStorage.getItem(Storage.keys.lang);
    const detectedLang = this.detectLanguage();
    const langToUse = savedLang || detectedLang;

    this.setLanguage(langToUse, false);
  },

  /**
   * Get translation for a key with optional variable interpolation
   * @param {string} key - Translation key (e.g., 'nav.muscle_map')
   * @param {Object} vars - Optional variables for interpolation
   * @returns {string} Translated string or key if not found
   */
  t(key, vars = {}) {
    // Return key if I18N not loaded
    if (typeof I18N === 'undefined') {
      return key;
    }

    const lang = this.currentLang;
    let translation = I18N.translations[lang]?.[key];

    // Fallback to English if translation not found
    if (!translation) {
      translation = I18N.translations.en?.[key];
    }

    // Return key if still not found
    if (!translation) {
      return key;
    }

    // Interpolate variables
    Object.entries(vars).forEach(([varName, value]) => {
      translation = translation.replace(new RegExp(`\\{${varName}\\}`, 'g'), value);
    });

    return translation;
  },

  /**
   * Set the current language
   * @param {string} lang - Language code
   * @param {boolean} rerender - Whether to re-render UI (default true)
   */
  setLanguage(lang, rerender = true) {
    // Check if I18N is loaded
    if (typeof I18N === 'undefined') {
      return;
    }

    // Validate language exists
    if (!I18N.languages.find(l => l.code === lang)) {
      lang = 'en';
    }

    this.currentLang = lang;
    AppState.settings.lang = lang;
    localStorage.setItem(Storage.keys.lang, lang);

    // Apply RTL if needed
    this.applyRtl();

    // Re-render all screens if requested
    if (rerender) {
      this.rerenderAll();
    }
  },

  /**
   * Apply RTL direction if current language is RTL
   */
  applyRtl() {
    if (typeof I18N === 'undefined') return;
    const isRtl = I18N.rtlLanguages.includes(this.currentLang);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = this.currentLang;
  },

  /**
   * Re-render all UI screens to apply new language
   */
  rerenderAll() {
    // Update navigation labels - text is directly in buttons, use data-i18n attribute
    document.querySelectorAll('.nav-tab').forEach(tab => {
      const i18nKey = tab.dataset.i18n;
      if (i18nKey) {
        tab.textContent = this.t(i18nKey);
      }
    });

    // Update screen headers
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (key && !el.classList.contains('nav-tab')) {
        el.textContent = this.t(key);
      }
    });

    // Re-render active screen
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
      const screenId = activeScreen.id;
      if (screenId === 'stats-card-screen') StatsCard.render();
      else if (screenId === 'log-screen') LogScreen.render();
      else if (screenId === 'muscle-map-screen') MuscleMap.render();
      else if (screenId === 'challenges-screen') ChallengesScreen.render();
      else if (screenId === 'friends-screen') FriendsScreen.render();
      else if (screenId === 'settings-screen') SettingsScreen.render();
    }
  },

  /**
   * Get skill name with translation
   * @param {string} skillId - Skill ID
   * @returns {string} Translated skill name
   */
  skillName(skillId) {
    return this.t(`skill.${skillId}`);
  },

  /**
   * Translate all static HTML elements with data-i18n attributes
   * Called once on page load after language is set
   */
  translateStaticElements() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (key) {
        el.textContent = this.t(key);
      }
    });
  },

  /**
   * Get emoji flag for a language code
   * @param {string} langCode - Language code
   * @returns {string} Emoji flag
   */
  getFlag(langCode) {
    const flags = {
      en: '\u{1F1EC}\u{1F1E7}', // 🇬🇧
      de: '\u{1F1E9}\u{1F1EA}', // 🇩🇪
      fr: '\u{1F1EB}\u{1F1F7}', // 🇫🇷
      es: '\u{1F1EA}\u{1F1F8}', // 🇪🇸
      it: '\u{1F1EE}\u{1F1F9}', // 🇮🇹
      pt: '\u{1F1F5}\u{1F1F9}', // 🇵🇹
      nl: '\u{1F1F3}\u{1F1F1}', // 🇳🇱
      pl: '\u{1F1F5}\u{1F1F1}', // 🇵🇱
      ru: '\u{1F1F7}\u{1F1FA}', // 🇷🇺
      ja: '\u{1F1EF}\u{1F1F5}', // 🇯🇵
      ko: '\u{1F1F0}\u{1F1F7}', // 🇰🇷
      zh: '\u{1F1E8}\u{1F1F3}', // 🇨🇳
      ar: '\u{1F1F8}\u{1F1E6}', // 🇸🇦
      tr: '\u{1F1F9}\u{1F1F7}', // 🇹🇷
      sv: '\u{1F1F8}\u{1F1EA}'  // 🇸🇪
    };
    return flags[langCode] || '\u{1F310}'; // 🌐
  }
};

// ============================================
// THEME SYSTEM
// ============================================
const Theme = {
  /**
   * Initialize theme system
   */
  init() {
    const savedTheme = localStorage.getItem(Storage.keys.theme) || 'classic';
    this.apply(savedTheme);
  },

  /**
   * Apply a theme
   * @param {string} theme - Theme name ('classic' or 'alt')
   */
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    AppState.settings.theme = theme;
  },

  /**
   * Set and save a theme
   * @param {string} theme - Theme name
   */
  set(theme) {
    this.apply(theme);
    localStorage.setItem(Storage.keys.theme, theme);
    Storage.save();
  },

  /**
   * Get current theme
   * @returns {string} Current theme name
   */
  get() {
    return AppState.settings.theme || 'classic';
  }
};

// ============================================
// INTRO MODAL (First-time users)
// ============================================
const IntroModal = {
  /**
   * Check if intro should be shown and show it
   */
  checkAndShow() {
    const totalLevel = getTotalLevel(AppState.skillXp);
    const dismissed = localStorage.getItem(Storage.keys.introDismissed);

    // Show if total level is 14 (all skills at level 1) and not dismissed
    if (totalLevel === 14 && !dismissed) {
      this.show();
    }
  },

  /**
   * Build language selector HTML with flags
   */
  buildLanguageSelector() {
    if (typeof I18N === 'undefined') return '';

    const currentLang = i18n.currentLang;
    const currentFlag = i18n.getFlag(currentLang);
    const currentName = I18N.languages.find(l => l.code === currentLang)?.name || 'English';

    const options = I18N.languages.map(lang => {
      const flag = i18n.getFlag(lang.code);
      const selected = lang.code === currentLang ? ' selected' : '';
      return `<option value="${lang.code}"${selected}>${flag} ${lang.name}</option>`;
    }).join('');

    return `
      <div class="intro-language-selector">
        <span class="intro-lang-label">${currentFlag}</span>
        <select class="intro-lang-select" id="intro-language-select">
          ${options}
        </select>
      </div>
    `;
  },

  /**
   * Show the intro modal
   */
  show() {
    const content = document.getElementById('intro-content');
    content.innerHTML = `
      <div class="intro-modal-content">
        ${this.buildLanguageSelector()}
        <h2 class="intro-title">${i18n.t('intro.title')}</h2>
        <p class="intro-subtitle">${i18n.t('intro.subtitle')}</p>
        <div class="intro-steps">
          <p>${i18n.t('intro.step1')}</p>
          <p>${i18n.t('intro.step2')}</p>
          <p>${i18n.t('intro.step3')}</p>
          <p>${i18n.t('intro.step4')}</p>
        </div>
        <button class="xp-tick-btn intro-got-it-btn" id="intro-dismiss">${i18n.t('intro.got_it')}</button>
      </div>
    `;

    // Language selector change handler
    const langSelect = content.querySelector('#intro-language-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        i18n.setLanguage(e.target.value);
        // Re-show intro with new language
        this.show();
      });
    }

    content.querySelector('#intro-dismiss').addEventListener('click', () => {
      this.dismiss();
    });

    Modal.show('intro-modal');
  },

  /**
   * Dismiss the intro modal
   */
  dismiss() {
    localStorage.setItem(Storage.keys.introDismissed, '1');
    Modal.hide('intro-modal');
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
        <span class="total-label">${i18n.t('stats_card.total_level')}</span>
        <span class="total-value">${totalLevel}</span>
      </div>
    `;
    tile.title = i18n.t('stats_card.total_level');
    return tile;
  },

  createSkillTile(skill) {
    const xp = AppState.skillXp[skill.id] || 0;
    const level = levelFromXp(xp);
    const icon = this.getSkillIcon(skill.id, 64);
    const skillName = i18n.skillName(skill.id);

    const tile = document.createElement('div');
    tile.className = 'skill-tile';
    tile.innerHTML = `
      <div class="tile-content">
        <div class="tile-left">
          <div class="tile-icon">${icon}</div>
          <span class="tile-label">${skillName}</span>
        </div>
        <div class="level-area">
          <span class="lvl-current">${level}</span>
          <span class="lvl-max">99</span>
        </div>
      </div>
    `;
    tile.title = skillName;

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
    const skillName = i18n.skillName(skillId);

    const content = document.getElementById('skill-detail-content');
    content.innerHTML = `
      <div class="skill-detail">
        <div class="skill-detail-icon">${StatsCard.getSkillIcon(skillId, 128)}</div>
        <div class="skill-detail-name">${skillName}</div>
        <div class="skill-detail-level">${level}</div>
        <div class="skill-detail-xp">
          <div class="skill-detail-xp-text">${i18n.t('common.experience')}</div>
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
            ${i18n.t('common.xp_to_level', { xp: (xpNeeded - xpIntoLevel).toLocaleString(), level: level + 1 })}
          </div>
        ` : `<div class="skill-detail-xp-text">${i18n.t('common.max_level')}</div>`}
        <button class="xp-tick-btn skill-detail-train-btn" id="train-skill-btn">${i18n.t('common.train')}</button>
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
    const entries = AppState.logEntries || [];

    if (entries.length === 0) {
      container.innerHTML = `<p class="empty-state">${i18n.t('log.empty')}</p>`;
      return;
    }

    // Group entries by day
    const grouped = this.groupByDay(entries);
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
    const skillName = skill ? i18n.skillName(skill.id) : '';
    const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Check for progressive overload indicators
    let indicator = '';
    if (prevEntry && prevEntry.exerciseId === entry.exerciseId) {
      if (entry.weight > prevEntry.weight) {
        indicator = `<span class="log-entry-indicator indicator-up">${i18n.t('log.weight_up')}</span>`;
      } else if (entry.weight === prevEntry.weight && entry.reps > prevEntry.reps) {
        indicator = `<span class="log-entry-indicator indicator-up">${i18n.t('log.reps_up')}</span>`;
      }
    }

    // Display weight in current unit
    const displayWeight = Units.display(entry.weight);

    // Spillover display
    let spilloverHtml = '';
    if (entry.spillover && entry.spillover.length > 0) {
      spilloverHtml = entry.spillover.map(s =>
        `<span class="log-entry-spillover">${i18n.t('log.spillover', { xp: s.xp, skill: i18n.skillName(s.skillId) })}</span>`
      ).join(' ');
    }

    const el = document.createElement('div');
    el.className = 'log-entry';
    el.innerHTML = `
      <div class="log-entry-main">
        <div class="log-entry-exercise">${exercise ? exercise.name : 'Unknown'}</div>
        <div class="log-entry-details">
          ${skillName} &bull; ${subcategory ? subcategory.name : ''}
        </div>
        <div class="log-entry-details">
          ${displayWeight} ${Units.label()} &times; ${entry.reps} reps
        </div>
        <div class="log-entry-time">${time} ${indicator}</div>
        ${spilloverHtml ? `<div class="log-entry-spillover-row">${spilloverHtml}</div>` : ''}
      </div>
      <div class="log-entry-right">
        <div class="log-entry-xp">+${entry.xpAwarded}</div>
        <div class="log-entry-skill-label">${skillName}</div>
        <button class="log-undo-btn" data-entry-id="${entry.id}">${i18n.t('log.undo')}</button>
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
    const skillName = i18n.skillName(entry.skillId);
    if (!confirm(i18n.t('log.undo_confirm', { xp: entry.xpAwarded, skill: skillName }))) {
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

    // Update action button text with translations
    const trainingPlansBtn = document.getElementById('open-training-plans');
    const customExerciseBtn = document.getElementById('open-custom-exercise');
    const statisticsBtn = document.getElementById('open-statistics');

    if (trainingPlansBtn) {
      trainingPlansBtn.textContent = i18n.t('muscle_map.create_plan');
      trainingPlansBtn.onclick = () => TrainingPlans.show();
    }

    if (customExerciseBtn) {
      customExerciseBtn.textContent = i18n.t('muscle_map.add_custom_exercise');
      customExerciseBtn.onclick = () => CustomExercises.show();
    }

    if (statisticsBtn) {
      statisticsBtn.textContent = i18n.t('muscle_map.statistics');
      statisticsBtn.onclick = () => StatisticsModal.show();
    }
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
      let exercises = getExercisesBySubcategory(subcategory.id);

      // Filter by equipment if equipment mode is enabled
      exercises = EquipmentFilter.filterExercises(exercises);

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

    // Add custom exercises for this skill
    const customExercises = CustomExercises.getByMuscle(AppState.training.skillId);
    if (customExercises.length > 0) {
      const filteredCustom = EquipmentFilter.filterExercises(customExercises);
      if (filteredCustom.length > 0) {
        exerciseListHtml += `
          <div class="exercise-group">
            <div class="exercise-group-header">Custom Exercises</div>
            <div class="exercise-group-list">
              ${filteredCustom.map(ex => `
                <div class="training-list-item${AppState.favorites[ex.id] ? ' favorite' : ''}"
                     data-exercise-id="${ex.id}" data-subcategory-id="custom">
                  ${ex.name}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    content.innerHTML = `
      <div class="training-step">
        <div class="training-step-title">${i18n.skillName(skill.id)}</div>
        <div class="training-muscle-name">${i18n.t('training.select_exercise')}</div>
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

    const skillName = i18n.skillName(skill.id);
    const content = document.getElementById('training-flow-content');
    content.innerHTML = `
      <button class="back-btn" id="back-to-exercises">&larr; ${i18n.t('training.back')}</button>
      <div class="exercise-detail">
        <div class="exercise-detail-name">
          ${exercise.name}
          <button class="favorite-btn${isFavorite ? ' active' : ''}" id="toggle-favorite">
            ${isFavorite ? '&#x2605;' : '&#x2606;'}
          </button>
        </div>
        <div class="exercise-detail-subcategory">${skillName} &bull; ${subcategory ? subcategory.name : ''}</div>

        <div class="input-group">
          <label class="input-label">${i18n.t('training.weight')} (${Units.label()})</label>
          <div class="input-row">
            <input type="range" class="input-slider" id="weight-slider"
                   min="${weightConfig.min}" max="${weightConfig.max}"
                   value="${defaultWeight}" step="${weightConfig.step}">
            <input type="number" class="input-number" id="weight-input"
                   value="${defaultWeight}" min="0" max="${weightConfig.max * 2}">
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">${i18n.t('training.reps')}</label>
          <div class="input-row">
            <input type="range" class="input-slider" id="reps-slider" min="1" max="30" value="${defaultReps}">
            <input type="number" class="input-number" id="reps-input" value="${defaultReps}" min="1" max="100">
          </div>
        </div>

        <p class="exercise-helper-text">${i18n.t('training.helper_text')}</p>

        <button class="xp-tick-btn" id="xp-tick-btn">${i18n.t('training.xp_tick')}</button>

        <div class="exercise-xp-bar">
          <div class="exercise-xp-bar-label">
            <span>${skillName} Lv. ${currentLevel}</span>
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

    // 2. Calculate and award spillover XP for compound exercises
    const spilloverXp = [];
    const spillover = getExerciseSpillover(exerciseId);
    if (spillover) {
      Object.entries(spillover).forEach(([targetSkillId, multiplier]) => {
        const spillXp = Math.round(xpGained * multiplier);
        if (spillXp > 0) {
          AppState.skillXp[targetSkillId] = (AppState.skillXp[targetSkillId] || 0) + spillXp;
          spilloverXp.push({ skillId: targetSkillId, xp: spillXp });
        }
      });
    }

    // 3. Create one complete log entry
    const logEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      skillId: skillId,
      subcategoryId: subcategoryId,
      exerciseId: exerciseId,
      weight: weight, // Stored in KG
      reps: reps,
      xpAwarded: xpGained,
      spillover: spilloverXp
    };
    AppState.logEntries.push(logEntry);

    // 4. Add to set history for statistics
    const setHistoryEntry = {
      ts: Date.now(),
      muscleId: skillId,
      exerciseId: exerciseId,
      reps: reps,
      weight: weight,
      xpAwarded: xpGained,
      spillover: spilloverXp
    };
    AppState.setHistory.push(setHistoryEntry);

    // Keep set history manageable (last 1000 entries)
    if (AppState.setHistory.length > 1000) {
      AppState.setHistory = AppState.setHistory.slice(-1000);
    }

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

    // Spillover XP is awarded silently (no toast) to keep focus on primary muscle

    // Update the XP bar in exercise detail immediately
    this.updateExerciseXpBar(skillId);

    // Refresh Stats Card if visible (or prepare for when user returns)
    StatsCard.render();

    // Check for level up
    const newLevel = levelFromXp(AppState.skillXp[skillId]);
    if (newLevel > currentLevel) {
      setTimeout(() => {
        alert(i18n.t('training.level_up', { skill: i18n.skillName(skillId), level: newLevel }));
      }, 500);
    }
  },

  /**
   * Show spillover XP toast
   */
  showSpilloverToast(spilloverXp) {
    const toast = document.getElementById('spillover-toast');
    if (!toast) return;

    const text = spilloverXp.map(s =>
      i18n.t('log.spillover', { xp: s.xp, skill: i18n.skillName(s.skillId) })
    ).join(', ');

    const textEl = toast.querySelector('.spillover-toast-text');
    if (textEl) {
      textEl.textContent = text;
    }
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  },

  /**
   * Update the XP bar in the exercise detail view
   */
  updateExerciseXpBar(skillId) {
    const currentXp = AppState.skillXp[skillId] || 0;
    const currentLevel = levelFromXp(currentXp);
    const progress = progressToNextLevel(currentXp);
    const progressColor = XpBarColors.getColor(progress);
    const skillName = i18n.skillName(skillId);

    const fill = document.getElementById('exercise-xp-fill');
    const label = document.querySelector('.exercise-xp-bar-label');

    if (fill) {
      fill.style.width = `${progress}%`;
      fill.style.background = progressColor;
    }
    if (label) {
      label.innerHTML = `<span>${skillName} Lv. ${currentLevel}</span><span>${progress}%</span>`;
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
        <h3 class="challenge-title">${i18n.t('challenges.workout_quest')}</h3>

        <div class="challenge-option">
          <label class="input-label">${i18n.t('challenges.body_focus')}</label>
          <div class="toggle-group" id="focus-toggle">
            <button class="toggle-btn active" data-value="random">${i18n.t('challenges.full_random')}</button>
            <button class="toggle-btn" data-value="upper">${i18n.t('challenges.upper_body')}</button>
            <button class="toggle-btn" data-value="lower">${i18n.t('challenges.lower_body')}</button>
          </div>
        </div>

        <div class="challenge-option">
          <label class="input-label">${i18n.t('challenges.workout_length')}</label>
          <div class="toggle-group" id="length-toggle">
            <button class="toggle-btn" data-value="short">${i18n.t('challenges.short')}</button>
            <button class="toggle-btn active" data-value="regular">${i18n.t('challenges.regular')}</button>
            <button class="toggle-btn" data-value="ironman">${i18n.t('challenges.ironman')}</button>
          </div>
          <div class="challenge-length-desc" id="length-desc">
            ${i18n.t('challenges.regular_desc')}
          </div>
        </div>

        <button class="xp-tick-btn challenge-start-btn" id="start-challenge">
          ${i18n.t('challenges.start')}
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
      short: i18n.t('challenges.short_desc'),
      regular: i18n.t('challenges.regular_desc'),
      ironman: i18n.t('challenges.ironman_desc')
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
          <div class="challenge-muscle-header">${i18n.skillName(muscle.skillId)}</div>
          <div class="challenge-exercises">
            ${exercisesHtml}
          </div>
        </div>
      `;
    });

    const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    container.innerHTML = `
      <div class="challenge-active">
        <h3 class="challenge-title">${i18n.t('challenges.active_quest')}</h3>
        <div class="challenge-progress-bar">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
            <div class="progress-text">${progress}%</div>
          </div>
        </div>
        <div class="challenge-info">
          ${i18n.t('challenges.sets_completed', { completed: completedSets, total: totalSets })}
        </div>
        <div class="challenge-muscles">
          ${musclesHtml}
        </div>
        <div class="challenge-actions">
          <button class="back-btn" id="abandon-challenge">${i18n.t('challenges.abandon')}</button>
          ${progress >= 100 ? `<button class="xp-tick-btn" id="complete-challenge">${i18n.t('challenges.complete')}</button>` : ''}
        </div>
      </div>
    `;

    // Abandon button
    container.querySelector('#abandon-challenge')?.addEventListener('click', () => {
      if (confirm(i18n.t('challenges.abandon_confirm'))) {
        AppState.challenge = null;
        Storage.save();
        this.render();
      }
    });

    // Complete button
    container.querySelector('#complete-challenge')?.addEventListener('click', () => {
      AppState.challenge.completed = true;
      Storage.save();
      alert(i18n.t('challenges.completed_msg'));
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

    // Build language options (with fallback if I18N not loaded)
    const languages = (typeof I18N !== 'undefined' && I18N.languages) ? I18N.languages : [{ code: 'en', name: 'English' }];
    const langOptions = languages.map(lang =>
      `<option value="${lang.code}"${lang.code === AppState.settings.lang ? ' selected' : ''}>${lang.name}</option>`
    ).join('');

    container.innerHTML = `
      <div class="settings-section">
        <h3 class="settings-title">${i18n.t('settings.units')}</h3>
        <div class="settings-option">
          <label class="input-label">${i18n.t('settings.weight_unit')}</label>
          <div class="toggle-group" id="unit-toggle">
            <button class="toggle-btn${AppState.settings.unit === 'kg' ? ' active' : ''}" data-value="kg">KG</button>
            <button class="toggle-btn${AppState.settings.unit === 'lbs' ? ' active' : ''}" data-value="lbs">LBS</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">${i18n.t('settings.language')}</h3>
        <div class="settings-option language-option">
          <select class="language-select" id="language-select">
            ${langOptions}
          </select>
          <button class="back-btn language-apply-btn" id="apply-language">${i18n.t('settings.apply_language') || 'Apply'}</button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">${i18n.t('settings.theme')}</h3>
        <div class="settings-option">
          <div class="toggle-group" id="theme-toggle">
            <button class="toggle-btn${AppState.settings.theme === 'classic' ? ' active' : ''}" data-value="classic">${i18n.t('settings.theme_classic')}</button>
            <button class="toggle-btn${AppState.settings.theme === 'alt' ? ' active' : ''}" data-value="alt">${i18n.t('settings.theme_alt')}</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">${i18n.t('settings.calibration')}</h3>
        <div class="settings-option">
          <button class="back-btn calibrate-btn" id="calibrate-skills">${i18n.t('settings.calibrate_skills')}</button>
          <p class="settings-info">${i18n.t('settings.calibrate_info')}</p>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">${i18n.t('settings.equipment')}</h3>
        <div class="settings-option">
          <label class="input-label">${i18n.t('settings.equipment_mode')}</label>
          <div class="toggle-group" id="equipment-mode-toggle">
            <button class="toggle-btn${!AppState.equipmentMode ? ' active' : ''}" data-value="off">${i18n.t('common.off')}</button>
            <button class="toggle-btn${AppState.equipmentMode ? ' active' : ''}" data-value="on">${i18n.t('common.on')}</button>
          </div>
          <p class="settings-info">${i18n.t('settings.equipment_mode_desc')}</p>
        </div>
        <div class="settings-option">
          <button class="back-btn" id="select-equipment">${i18n.t('settings.select_equipment')}</button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">${i18n.t('settings.data')}</h3>
        <div class="settings-option">
          <button class="back-btn danger-btn" id="reset-data">${i18n.t('settings.reset_data')}</button>
          <p class="settings-warning">${i18n.t('settings.reset_warning')}</p>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-title">${i18n.t('settings.about')}</h3>
        <p class="settings-info">${i18n.t('settings.version')}</p>
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

    // Language apply button
    container.querySelector('#apply-language').addEventListener('click', () => {
      const selectedLang = container.querySelector('#language-select').value;
      i18n.setLanguage(selectedLang);
      // Force page reload to ensure all translations are applied correctly
      location.reload();
    });

    // Theme toggle
    const themeGroup = container.querySelector('#theme-toggle');
    themeGroup.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        themeGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Theme.set(btn.dataset.value);
      });
    });

    // Equipment mode toggle
    const equipmentModeGroup = container.querySelector('#equipment-mode-toggle');
    equipmentModeGroup.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        equipmentModeGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.equipmentMode = btn.dataset.value === 'on';
        Storage.save();
      });
    });

    // Select equipment button
    container.querySelector('#select-equipment').addEventListener('click', () => {
      EquipmentFilter.show();
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
            <span class="calibration-skill-name">${i18n.skillName(skill.id)}</span>
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
        <h3 class="calibration-title">${i18n.t('calibration.title')}</h3>
        <p class="calibration-desc">${i18n.t('calibration.desc')}</p>

        <div class="calibration-skills-list">
          ${skillRowsHtml}
        </div>

        <div class="calibration-actions">
          <button class="back-btn" id="calibration-cancel">${i18n.t('calibration.cancel')}</button>
          <button class="xp-tick-btn calibration-save-btn" id="calibration-save">${i18n.t('calibration.save')}</button>
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
// TRAINING PLANS
// ============================================
const TrainingPlans = {
  /**
   * Show the training plans modal
   */
  show() {
    this.renderList();
    Modal.show('training-plans-modal');
  },

  /**
   * Render the plans list
   */
  renderList() {
    const content = document.getElementById('training-plans-content');
    const plans = AppState.trainingPlans || [];

    if (plans.length === 0) {
      content.innerHTML = `
        <div class="plans-empty">
          <h3 class="plans-title">${i18n.t('plans.title')}</h3>
          <div class="plans-empty-text">
            <p>${i18n.t('plans.no_plans')}</p>
            <p>${i18n.t('plans.create_first')}</p>
          </div>
          <button class="xp-tick-btn" id="create-plan-btn">${i18n.t('plans.create')}</button>
        </div>
      `;
      content.querySelector('#create-plan-btn').addEventListener('click', () => {
        this.showEditor();
      });
      return;
    }

    let plansHtml = plans.map(plan => `
      <div class="plan-card" data-plan-id="${plan.id}">
        <div class="plan-card-header">
          <span class="plan-name">${plan.name}</span>
          <span class="plan-meta">${i18n.t('plans.exercises_count', { count: plan.items.length })}</span>
        </div>
        <div class="plan-card-actions">
          <button class="xp-tick-btn plan-run-btn" data-plan-id="${plan.id}">${i18n.t('plans.run')}</button>
          <button class="back-btn plan-edit-btn" data-plan-id="${plan.id}">${i18n.t('plans.edit')}</button>
          <button class="back-btn danger-btn plan-delete-btn" data-plan-id="${plan.id}">${i18n.t('plans.delete')}</button>
        </div>
      </div>
    `).join('');

    content.innerHTML = `
      <div class="plans-list">
        ${plansHtml}
      </div>
      <button class="xp-tick-btn plans-create-btn" id="create-plan-btn">${i18n.t('plans.create')}</button>
    `;

    // Add event handlers
    content.querySelector('#create-plan-btn').addEventListener('click', () => {
      this.showEditor();
    });

    content.querySelectorAll('.plan-run-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const planId = btn.dataset.planId;
        this.runPlan(planId);
      });
    });

    content.querySelectorAll('.plan-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const planId = btn.dataset.planId;
        this.showEditor(planId);
      });
    });

    content.querySelectorAll('.plan-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const planId = btn.dataset.planId;
        this.deletePlan(planId);
      });
    });
  },

  /**
   * Show the plan editor
   * @param {string} planId - Optional plan ID to edit
   */
  showEditor(planId = null) {
    const plan = planId ? AppState.trainingPlans.find(p => p.id === planId) : null;
    const content = document.getElementById('plan-editor-content');

    // Build muscle/exercise dropdown options
    const muscleOptions = SKILLS.map(s => `<option value="${s.id}">${i18n.skillName(s.id)}</option>`).join('');

    content.innerHTML = `
      <div class="plan-editor">
        <h3 class="plan-editor-title">${plan ? i18n.t('plans.edit') : i18n.t('plans.create')}</h3>
        <div class="plan-editor-form">
          <input type="text" class="plan-name-input" id="plan-name"
                 placeholder="${i18n.t('plans.name_placeholder')}"
                 value="${plan ? plan.name : ''}">

          <div class="plan-items-container" id="plan-items">
            ${plan ? plan.items.map((item, idx) => this.createItemRow(item, idx, muscleOptions)).join('') : ''}
          </div>

          <button class="back-btn plan-add-exercise-btn" id="add-exercise-btn">${i18n.t('plans.add_exercise')}</button>

          <div class="plan-editor-actions">
            <button class="back-btn" id="plan-cancel">${i18n.t('plans.cancel')}</button>
            <button class="xp-tick-btn" id="plan-save">${i18n.t('plans.save')}</button>
          </div>
        </div>
      </div>
    `;

    this.currentEditPlanId = planId;

    // Add exercise button
    content.querySelector('#add-exercise-btn').addEventListener('click', () => {
      this.addItemRow(muscleOptions);
    });

    // Cancel button
    content.querySelector('#plan-cancel').addEventListener('click', () => {
      Modal.hide('plan-editor-modal');
    });

    // Save button
    content.querySelector('#plan-save').addEventListener('click', () => {
      this.savePlan();
    });

    Modal.show('plan-editor-modal');
  },

  /**
   * Create an item row HTML
   */
  createItemRow(item, index, muscleOptions) {
    const exercises = item ? getExercisesBySkill(item.muscleId) : [];
    const exerciseOptions = exercises.map(e =>
      `<option value="${e.id}"${e.id === item?.exerciseId ? ' selected' : ''}>${e.name}</option>`
    ).join('');

    return `
      <div class="plan-item-row" data-index="${index}">
        <select class="plan-muscle-select" data-index="${index}">
          <option value="">-- ${i18n.t('muscle_map.subtitle')} --</option>
          ${muscleOptions.replace(`value="${item?.muscleId}"`, `value="${item?.muscleId}" selected`)}
        </select>
        <select class="plan-exercise-select" data-index="${index}">
          <option value="">-- ${i18n.t('training.select_exercise')} --</option>
          ${exerciseOptions}
        </select>
        <input type="number" class="plan-sets-input" data-index="${index}"
               placeholder="${i18n.t('plans.sets')}" min="1" max="10" value="${item?.sets || 3}">
        <button class="plan-item-remove" data-index="${index}">&times;</button>
      </div>
    `;
  },

  /**
   * Add a new item row
   */
  addItemRow(muscleOptions) {
    const container = document.getElementById('plan-items');
    const index = container.children.length;
    const rowHtml = this.createItemRow(null, index, muscleOptions);
    container.insertAdjacentHTML('beforeend', rowHtml);
    this.attachItemRowHandlers(index);
  },

  /**
   * Attach handlers to item row
   */
  attachItemRowHandlers(index) {
    const muscleSelect = document.querySelector(`.plan-muscle-select[data-index="${index}"]`);
    const exerciseSelect = document.querySelector(`.plan-exercise-select[data-index="${index}"]`);
    const removeBtn = document.querySelector(`.plan-item-remove[data-index="${index}"]`);

    if (muscleSelect) {
      muscleSelect.addEventListener('change', () => {
        const muscleId = muscleSelect.value;
        const exercises = muscleId ? getExercisesBySkill(muscleId) : [];
        exerciseSelect.innerHTML = `
          <option value="">-- ${i18n.t('training.select_exercise')} --</option>
          ${exercises.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
        `;
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        removeBtn.closest('.plan-item-row').remove();
      });
    }
  },

  /**
   * Save the current plan
   */
  savePlan() {
    const name = document.getElementById('plan-name').value.trim();
    if (!name) {
      alert(i18n.t('plans.name_placeholder'));
      return;
    }

    const items = [];
    document.querySelectorAll('.plan-item-row').forEach(row => {
      const muscleId = row.querySelector('.plan-muscle-select').value;
      const exerciseId = row.querySelector('.plan-exercise-select').value;
      const sets = parseInt(row.querySelector('.plan-sets-input').value) || 3;

      if (muscleId && exerciseId) {
        items.push({ muscleId, exerciseId, sets });
      }
    });

    if (items.length === 0) {
      alert(i18n.t('plans.add_exercise'));
      return;
    }

    if (this.currentEditPlanId) {
      // Update existing plan
      const plan = AppState.trainingPlans.find(p => p.id === this.currentEditPlanId);
      if (plan) {
        plan.name = name;
        plan.items = items;
      }
    } else {
      // Create new plan
      const newPlan = {
        id: `plan_${Date.now()}`,
        name: name,
        createdAt: Date.now(),
        items: items
      };
      AppState.trainingPlans.push(newPlan);
    }

    Storage.save();
    Modal.hide('plan-editor-modal');
    this.renderList();
  },

  /**
   * Delete a plan
   */
  deletePlan(planId) {
    if (!confirm(i18n.t('plans.delete_confirm'))) return;

    AppState.trainingPlans = AppState.trainingPlans.filter(p => p.id !== planId);
    Storage.save();
    this.renderList();
  },

  /**
   * Run a training plan
   */
  runPlan(planId) {
    const plan = AppState.trainingPlans.find(p => p.id === planId);
    if (!plan || plan.items.length === 0) return;

    Modal.hide('training-plans-modal');

    // Start with the first exercise
    const firstItem = plan.items[0];

    // Set up training state
    AppState.training = {
      skillId: firstItem.muscleId,
      subcategoryId: null,
      exerciseId: firstItem.exerciseId
    };

    // Find subcategory for this exercise
    const exercise = getExerciseById(firstItem.exerciseId);
    if (exercise) {
      AppState.training.subcategoryId = exercise.subcategoryId || getSubcategoriesBySkill(firstItem.muscleId)[0]?.id;
    }

    TrainingFlow.showExerciseDetail();
    Modal.show('training-modal');
  }
};

// ============================================
// CUSTOM EXERCISES
// ============================================
const CustomExercises = {
  /**
   * Show custom exercise editor
   */
  show() {
    const content = document.getElementById('custom-exercise-content');
    const muscleOptions = SKILLS.map(s => `<option value="${s.id}">${i18n.skillName(s.id)}</option>`).join('');
    const unit = Units.label();

    content.innerHTML = `
      <div class="custom-exercise-editor">
        <h3 class="custom-exercise-title">${i18n.t('custom.title')}</h3>

        <div class="custom-exercise-form">
          <div class="input-group">
            <label class="input-label">${i18n.t('custom.name')}</label>
            <input type="text" class="custom-exercise-input" id="custom-name" placeholder="${i18n.t('custom.name_placeholder')}">
          </div>

          <div class="input-group">
            <label class="input-label">${i18n.t('custom.target_muscle')}</label>
            <select class="custom-exercise-select" id="custom-muscle">
              ${muscleOptions}
            </select>
          </div>

          <div class="input-group">
            <label class="input-label">${i18n.t('custom.exercise_type')}</label>
            <select class="custom-exercise-select" id="custom-type">
              <option value="compound">Compound</option>
              <option value="isolation">Isolation</option>
              <option value="bodyweight">Bodyweight</option>
            </select>
          </div>

          <div class="input-group">
            <label class="input-label">${i18n.t('custom.weight_range')} (${unit})</label>
            <select class="custom-exercise-select" id="custom-weight-preset">
              <option value="light">${i18n.t('custom.weight_light')}</option>
              <option value="medium" selected>${i18n.t('custom.weight_medium')}</option>
              <option value="heavy">${i18n.t('custom.weight_heavy')}</option>
              <option value="custom">${i18n.t('custom.weight_custom')}</option>
            </select>
          </div>

          <div class="input-group custom-weight-range" id="custom-weight-range" style="display: none;">
            <div class="input-row">
              <div class="input-half">
                <label class="input-label-small">${i18n.t('custom.weight_min')}</label>
                <input type="number" class="custom-exercise-input" id="custom-weight-min" value="0" min="0">
              </div>
              <div class="input-half">
                <label class="input-label-small">${i18n.t('custom.weight_max')}</label>
                <input type="number" class="custom-exercise-input" id="custom-weight-max" value="100" min="0">
              </div>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">${i18n.t('custom.xp_mode')}</label>
            <select class="custom-exercise-select" id="custom-xp-mode">
              <option value="standard">${i18n.t('custom.xp_standard')}</option>
              <option value="custom">${i18n.t('custom.xp_custom')}</option>
            </select>
          </div>

          <div class="input-group" id="custom-xp-group" style="display: none;">
            <label class="input-label">${i18n.t('custom.xp_per_set')}</label>
            <input type="number" class="custom-exercise-input" id="custom-xp-value" value="50" min="1" max="500">
          </div>

          <div class="custom-exercise-actions">
            <button class="back-btn" id="custom-cancel">${i18n.t('common.cancel')}</button>
            <button class="xp-tick-btn" id="custom-save">${i18n.t('common.save')}</button>
          </div>
        </div>
      </div>
    `;

    // Toggle custom weight range visibility
    const weightPreset = content.querySelector('#custom-weight-preset');
    const weightRangeDiv = content.querySelector('#custom-weight-range');
    weightPreset.addEventListener('change', () => {
      weightRangeDiv.style.display = weightPreset.value === 'custom' ? 'block' : 'none';
    });

    // Toggle custom XP visibility
    const xpMode = content.querySelector('#custom-xp-mode');
    const xpGroup = content.querySelector('#custom-xp-group');
    xpMode.addEventListener('change', () => {
      xpGroup.style.display = xpMode.value === 'custom' ? 'block' : 'none';
    });

    content.querySelector('#custom-cancel').addEventListener('click', () => {
      Modal.hide('custom-exercise-modal');
    });

    content.querySelector('#custom-save').addEventListener('click', () => {
      this.saveExercise();
    });

    Modal.show('custom-exercise-modal');
  },

  /**
   * Save custom exercise
   */
  saveExercise() {
    const name = document.getElementById('custom-name').value.trim();
    const muscleId = document.getElementById('custom-muscle').value;
    const type = document.getElementById('custom-type').value;
    const weightPreset = document.getElementById('custom-weight-preset').value;
    const xpMode = document.getElementById('custom-xp-mode').value;

    if (!name) {
      alert(i18n.t('custom.name') + '!');
      return;
    }

    // Determine weight range based on preset or custom values
    let minWeight, maxWeight;
    if (weightPreset === 'custom') {
      minWeight = parseFloat(document.getElementById('custom-weight-min').value) || 0;
      maxWeight = parseFloat(document.getElementById('custom-weight-max').value) || 100;
    } else {
      const presets = {
        light: { min: 0, max: 30 },
        medium: { min: 0, max: 60 },
        heavy: { min: 0, max: 120 }
      };
      minWeight = presets[weightPreset].min;
      maxWeight = presets[weightPreset].max;
    }

    // Convert to KG if user is using LBS
    const minWeightKg = Units.toKg(minWeight);
    const maxWeightKg = Units.toKg(maxWeight);
    const defaultWeightKg = Math.round((minWeightKg + maxWeightKg) / 2);

    // Get custom XP if selected
    let customXp = null;
    if (xpMode === 'custom') {
      customXp = parseInt(document.getElementById('custom-xp-value').value) || 50;
    }

    const exercise = {
      id: `custom_${Date.now()}`,
      name: name,
      muscleId: muscleId,
      type: type,
      weight: {
        min: minWeightKg,
        max: maxWeightKg,
        step: 2.5,
        default: defaultWeightKg
      },
      referenceWeight: defaultWeightKg,
      xpMode: xpMode,
      customXpPerSet: customXp,
      isCustom: true
    };

    AppState.customExercises.push(exercise);
    Storage.save();
    Modal.hide('custom-exercise-modal');

    // Show success toast
    this.showSuccessToast(name);
  },

  /**
   * Show success toast when exercise is created
   */
  showSuccessToast(exerciseName) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('success-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'success-toast';
      toast.className = 'success-toast';
      toast.innerHTML = '<span class="success-toast-text"></span>';
      document.body.appendChild(toast);
    }

    const textEl = toast.querySelector('.success-toast-text');
    textEl.textContent = `✓ ${exerciseName} ${i18n.t('custom.created') || 'created'}`;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  },

  /**
   * Get all custom exercises for a muscle
   */
  getByMuscle(muscleId) {
    if (!AppState.customExercises) return [];
    return AppState.customExercises.filter(e => e.muscleId === muscleId);
  },

  /**
   * Get a custom exercise by ID
   */
  getById(exerciseId) {
    if (!AppState.customExercises) return null;
    return AppState.customExercises.find(e => e.id === exerciseId);
  },

  /**
   * Delete a custom exercise
   */
  delete(exerciseId) {
    AppState.customExercises = AppState.customExercises.filter(e => e.id !== exerciseId);
    Storage.save();
  }
};

// ============================================
// EQUIPMENT FILTER
// ============================================
const EquipmentFilter = {
  /**
   * Show equipment selection modal
   */
  show() {
    const content = document.getElementById('equipment-content');
    const selectedEquipment = AppState.equipment || [];

    const equipmentHtml = EQUIPMENT_TYPES.map(eq => {
      const isChecked = selectedEquipment.includes(eq.id);
      return `
        <div class="equipment-checkbox${isChecked ? ' checked' : ''}" data-equipment="${eq.id}">
          <input type="checkbox" value="${eq.id}" ${isChecked ? 'checked' : ''}>
          <span class="equipment-check-icon">✓</span>
          <span class="equipment-label">${i18n.t(`equipment.${eq.id}`)}</span>
        </div>
      `;
    }).join('');

    content.innerHTML = `
      <div class="equipment-selector">
        <h3 class="equipment-title">${i18n.t('equipment.title')}</h3>
        <div class="equipment-grid">
          ${equipmentHtml}
        </div>
        <button class="xp-tick-btn equipment-done-btn" id="equipment-done">${i18n.t('equipment.done')}</button>
      </div>
    `;

    // Toggle equipment selection on click
    content.querySelectorAll('.equipment-checkbox').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('checked');
        const checkbox = item.querySelector('input');
        checkbox.checked = !checkbox.checked;
      });
    });

    content.querySelector('#equipment-done').addEventListener('click', () => {
      this.save();
    });

    Modal.show('equipment-modal');
  },

  /**
   * Save selected equipment
   */
  save() {
    const checkboxes = document.querySelectorAll('.equipment-checkbox.checked');
    AppState.equipment = Array.from(checkboxes).map(cb => cb.dataset.equipment);
    Storage.save();
    Modal.hide('equipment-modal');
  },

  /**
   * Filter exercises by available equipment
   */
  filterExercises(exercises) {
    if (!AppState.equipmentMode || !AppState.equipment || AppState.equipment.length === 0) {
      return exercises;
    }

    return exercises.filter(ex => {
      if (!ex.requiredEquipment || ex.requiredEquipment.length === 0) {
        return true;
      }
      // Exercise is available if user has ALL required equipment
      return ex.requiredEquipment.every(eq => AppState.equipment.includes(eq));
    });
  },

  /**
   * Toggle equipment mode on/off
   */
  toggle() {
    AppState.equipmentMode = !AppState.equipmentMode;
    Storage.save();
  }
};

// ============================================
// STATISTICS MODAL
// ============================================
const StatisticsModal = {
  /**
   * Show the statistics modal
   */
  show() {
    const content = document.getElementById('statistics-content');
    const setHistory = AppState.setHistory || [];

    if (setHistory.length < 5) {
      content.innerHTML = `
        <div class="stats-empty">
          <h3>${i18n.t('stats.title')}</h3>
          <p>${i18n.t('stats.no_data')}</p>
          <button class="back-btn" id="stats-close">${i18n.t('stats.close')}</button>
        </div>
      `;
      content.querySelector('#stats-close').addEventListener('click', () => {
        Modal.hide('statistics-modal');
      });
      Modal.show('statistics-modal');
      return;
    }

    // Calculate metrics for radar chart
    const metrics = this.calculateMetrics();

    content.innerHTML = `
      <div class="statistics-modal-content">
        <h3 class="stats-modal-title">${i18n.t('stats.title')}</h3>

        <div class="stats-radar-container">
          ${this.renderRadarChart(metrics)}
        </div>

        <div class="stats-muscle-changes">
          <h4>${i18n.t('stats.muscle_changes')}</h4>
          ${this.renderMuscleChanges()}
        </div>

        <button class="back-btn stats-close-btn" id="stats-close">${i18n.t('stats.close')}</button>
      </div>
    `;

    content.querySelector('#stats-close').addEventListener('click', () => {
      Modal.hide('statistics-modal');
    });

    Modal.show('statistics-modal');
  },

  /**
   * Calculate metrics for radar chart
   */
  calculateMetrics() {
    const setHistory = AppState.setHistory || [];
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const recentSets = setHistory.filter(s => s.ts >= weekAgo);

    // Upper body muscles
    const upperMuscles = ['chest', 'back_lats', 'back_erector', 'traps', 'neck', 'delts', 'biceps', 'triceps', 'forearms'];
    // Lower body muscles
    const lowerMuscles = ['core', 'glutes', 'quads', 'hamstrings', 'calves'];

    // Calculate percentages
    const upperSets = recentSets.filter(s => upperMuscles.includes(s.muscleId)).length;
    const lowerSets = recentSets.filter(s => lowerMuscles.includes(s.muscleId)).length;
    const totalSets = recentSets.length || 1;

    // Consistency: training days in last week
    const trainingDays = new Set(recentSets.map(s => new Date(s.ts).toDateString())).size;

    // Volume: total sets (normalized to 100 max at 50 sets)
    const volume = Math.min(100, (recentSets.length / 50) * 100);

    // Diversity: unique exercises used
    const uniqueExercises = new Set(recentSets.map(s => s.exerciseId)).size;
    const diversity = Math.min(100, (uniqueExercises / 15) * 100);

    // Progression: weight increases (simplified)
    const progression = 50; // Default middle value

    return {
      upperBody: Math.round((upperSets / totalSets) * 100),
      lowerBody: Math.round((lowerSets / totalSets) * 100),
      consistency: Math.round((trainingDays / 7) * 100),
      volume: Math.round(volume),
      diversity: Math.round(diversity),
      progression: progression
    };
  },

  /**
   * Render SVG radar chart
   */
  renderRadarChart(metrics) {
    const size = 240;
    const center = size / 2;
    const radius = 70;

    // Labels and values
    const axes = [
      { label: i18n.t('stats.radar_upper'), value: metrics.upperBody },
      { label: i18n.t('stats.radar_lower'), value: metrics.lowerBody },
      { label: i18n.t('stats.radar_consistency'), value: metrics.consistency },
      { label: i18n.t('stats.radar_volume'), value: metrics.volume },
      { label: i18n.t('stats.radar_diversity'), value: metrics.diversity },
      { label: i18n.t('stats.radar_progression'), value: metrics.progression }
    ];

    const angleStep = (Math.PI * 2) / axes.length;

    // Calculate points for the data polygon
    const points = axes.map((axis, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (axis.value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    });

    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    // Generate axis lines and labels
    let axisLines = '';
    let labels = '';
    axes.forEach((axis, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x2 = center + radius * Math.cos(angle);
      const y2 = center + radius * Math.sin(angle);
      const labelX = center + (radius + 30) * Math.cos(angle);
      const labelY = center + (radius + 30) * Math.sin(angle);

      axisLines += `<line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="#3d352a" stroke-width="1"/>`;
      labels += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" fill="#a0a0a0" font-size="9">${axis.label}</text>`;
    });

    // Concentric circles for grid
    let circles = '';
    [0.25, 0.5, 0.75, 1].forEach(scale => {
      circles += `<circle cx="${center}" cy="${center}" r="${radius * scale}" fill="none" stroke="#3d352a" stroke-width="1" opacity="0.5"/>`;
    });

    return `
      <svg class="radar-chart" viewBox="0 0 ${size} ${size}">
        ${circles}
        ${axisLines}
        <polygon points="${polygonPoints}" fill="rgba(255, 152, 31, 0.3)" stroke="#ff981f" stroke-width="2"/>
        ${labels}
      </svg>
    `;
  },

  /**
   * Render muscle changes list
   */
  renderMuscleChanges() {
    const setHistory = AppState.setHistory || [];
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const recentSets = setHistory.filter(s => s.ts >= weekAgo);

    // Count sets per muscle this week
    const muscleSets = {};
    recentSets.forEach(s => {
      muscleSets[s.muscleId] = (muscleSets[s.muscleId] || 0) + 1;
    });

    return SKILLS.map(skill => {
      const sets = muscleSets[skill.id] || 0;
      const indicator = sets > 0 ? `<span class="muscle-change-up">${sets} ${i18n.t('stats.sets_week')}</span>` : `<span class="muscle-change-none">${i18n.t('stats.no_change')}</span>`;
      return `
        <div class="muscle-change-row">
          <span class="muscle-change-name">${i18n.skillName(skill.id)}</span>
          ${indicator}
        </div>
      `;
    }).join('');
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
                 placeholder="${i18n.t('friends.search_placeholder')}" value="${this.searchQuery}">
          <button class="xp-tick-btn friends-share-btn" id="share-progress">${i18n.t('friends.share_progress')}</button>
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
          <p>${i18n.t('friends.no_friends')}</p>
          <p>${i18n.t('friends.get_started')}</p>
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
        <button class="back-btn" id="friends-prev" ${this.currentPage === 0 ? 'disabled' : ''}>${i18n.t('friends.prev')}</button>
        <span class="friends-page-info">${i18n.t('friends.page_info', { current: this.currentPage + 1, total: totalPages })}</span>
        <button class="back-btn" id="friends-next" ${this.currentPage >= totalPages - 1 ? 'disabled' : ''}>${i18n.t('friends.next')}</button>
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
    const name = prompt(i18n.t('friends.share_prompt'), currentName);

    if (name === null) return; // Cancelled
    if (!name.trim()) {
      alert(i18n.t('friends.invalid_name'));
      return;
    }

    const sanitizedName = name.trim();

    // Build the shared record
    const record = {
      name: sanitizedName,
      updatedAt: new Date().toISOString(),
      skills: {},
      appVersion: '0.4'
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

    alert(i18n.t('friends.share_success', { name: sanitizedName }));
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
              <span class="tile-label">${i18n.skillName(skill.id)}</span>
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
          <span class="total-label">${i18n.t('stats_card.total_level')}</span>
          <span class="total-value">${totalLevel}</span>
        </div>
      </div>
    `;

    content.innerHTML = `
      <div class="friend-view-header">
        <h3>${i18n.t('friends.viewing', { name: friend.name })}</h3>
        <p class="friend-view-meta">${i18n.t('friends.last_updated', { date: new Date(friend.updatedAt).toLocaleString() })}</p>
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

  // Initialize i18n system (detects OS language if no saved preference)
  i18n.init();

  // Initialize theme system
  Theme.init();

  // Initialize components
  Modal.init();
  Navigation.init();

  // Translate all static elements with data-i18n attributes
  i18n.translateStaticElements();

  // Check if we should show intro modal
  IntroModal.checkAndShow();

  // Expose reset function globally for testing
  window.resetXPGains = Storage.reset.bind(Storage);

  console.log('XPGains v0.4 initialized. Use resetXPGains() to clear all data.');
});
