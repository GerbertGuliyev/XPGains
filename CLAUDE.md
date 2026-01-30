# XPGains - Claude Code Context

## Project Overview

**XPGains** is a gamified fitness tracker inspired by Old School RuneScape (OSRS). It transforms strength training into an RPG-like experience where 14 muscle groups are treated as "skills" that can be leveled from 1 to 99 through consistent training.

The app rewards users with XP for logging workout sets, calculated based on weight lifted, reps performed, and exercise type. The visual design mimics OSRS's distinctive aesthetic, including the characteristic skill card grid layout.

**Current Version:** v0.08

---

## Current Feature List

### Core Features
- **Muscle Map** - Interactive PNG body diagram with hit-mask pixel sampling for accurate muscle selection
- **Stats Card** - OSRS-style 5x3 grid displaying all 14 muscle skills with current/max levels + Total Level tile
- **Training Flow** - Muscle selection → Exercise selection → Weight/Reps input → XP award
- **Training Log** - Complete history of logged sets, grouped by day with XP totals
- **Undo** - Each log entry has an Undo button to reverse accidental XP ticks (subtracts XP, removes entry)
- **XP Toast** - Visual feedback showing XP gained after each set

### v0.4 Features

#### Internationalization (i18n)
- **15 Languages** - English, German, French, Spanish, Italian, Portuguese, Dutch, Polish, Czech, Swedish, Norwegian, Danish, Finnish, Russian, Arabic
- **Complete Translations** - German and Russian fully translated; other languages fall back to English
- **RTL Support** - Arabic displays right-to-left with proper layout mirroring
- **OS Language Detection** - Automatically detects browser/OS language on first visit
- **Language Selector** - Dropdown in Settings and Intro Modal with emoji flags
- **Dynamic UI Updates** - All text updates when language changes (requires Apply button)

#### Theme System
- **Classic Theme** - Original OSRS-inspired dark theme (default for most languages)
- **Mithril Theme** - Dark charcoal palette with purple accents and slightly desaturated skill icons
- **Russian Default** - Mithril theme auto-selected for Russian browser language
- **CSS Custom Properties** - Theme applied via `data-theme` attribute on `<html>`

#### Intro Modal
- **First-Time Welcome** - Shows for new users (Total Level = 14)
- **Quick Start Guide** - 3 simple steps explaining how to use the app
- **Language Selector** - Choose language with emoji flags before starting
- **Theme Toggle** - Choose Classic or Mithril theme directly in welcome screen
- **Full Black Background** - Clean, focused presentation
- **Dismissible** - "Get Started" button sets `xpgains_intro_dismissed` flag

#### PWA Support
- **manifest.json** - Enables "Add to Home Screen" on mobile
- **App Icons** - 120px, 167px, 180px icons for iOS/Android
- **Standalone Mode** - Runs without browser chrome when installed
- **Theme Color** - Orange (#ff981f) status bar on supported devices

#### Training Plans
- **Plan Builder** - Create named workout plans with multiple exercises
- **Exercise Selection** - Pick muscle → exercise with optional sets/reps/weight targets
- **Plan Library** - View, edit, delete saved plans
- **Run Plan** - Execute plan items with prefilled values from plan

#### Custom Exercises
- **Create Your Own** - Define exercises not in the default list
- **Weight Presets** - Light/Medium/Heavy/Custom weight range options
- **Custom XP Mode** - Option to set fixed XP per set instead of standard calculation
- **Muscle Assignment** - Link custom exercises to any of the 14 muscle groups
- **Success Toast** - Confirmation message with fade effect when created

#### Equipment Filtering
- **Equipment Mode** - Toggle in Settings to enable/disable filtering
- **Equipment Selection** - Checkboxes for: Bench, Dumbbells, Barbell, Cable, Pull-up Bar, Squat Rack, Machines, Bands, Bodyweight
- **Smart Filtering** - Only shows exercises matching your available equipment
- **All Exercises Tagged** - 48 exercises have `requiredEquipment` arrays in data.js

#### Spillover XP
- **Secondary Muscle XP** - Compound exercises award bonus XP to secondary muscles
- **Silent Awards** - Spillover XP given without toast notification (less intrusive)
- **Balanced Percentages** - 5-25% spillover to keep progression fair
- **Examples**: Bench Press → Triceps 15%, Delts 10%; Squats → Glutes 25%, Hamstrings 15%

#### Statistics Modal
- **Radar Chart** - Pure SVG visualization of 6 training metrics
- **Metrics Tracked**: Upper Body %, Lower Body %, Consistency, Volume, Diversity, Progression
- **Muscle Changes** - Shows % improvement vs previous week for all 14 muscles
- **Set History** - Detailed tracking with timestamps for analytics

#### Additional Improvements
- **Muscle Map Scaling** - Responsive sizing with `clamp()` and viewport constraints
- **Text Wrapping** - Skill labels and statistics wrap instead of truncating
- **Browser Translation Prevention** - Meta tags prevent auto-translation interference

### XP System
- **Geometric progression** - Calibrated for 6-8 years to max a skill at baseline volume
- **Level cap** - 99 per skill (1,386 total across all 14 skills)
- **Base XP values** - Compound exercises: 50 XP, Isolation: 35 XP
- **Reps factor** - Scales from 0.6x to 2.0x based on rep count
- **Intensity factor** - Scales based on weight vs reference weight (0.7x to 1.6x)
- **XP Bar Color Interpolation** - Progress bar gradient from red→orange→yellow→green

### Bonus Systems
- **Neglected Muscle Bonus** - +10% XP for muscles not trained in 7+ days (only if previously trained)
- **Diminishing Returns** - Reduced XP for repeated same-weight sets (session-based)
- **Grace period** - Increases with skill level (1 + floor(level/15))

### Challenges/Quests
- **Short** - 1 muscle, 1 exercise, 4 sets
- **Regular** - 2 muscles, 3 exercises each, 3-4 sets per exercise
- **Ironman** - 3 muscles, 4 exercises each, 4 sets per exercise
- Body focus options: Full Random, Upper Body, Lower Body

### Friends System
- **Friends Tab** - View and manage friend list with search and pagination
- **Share Progress** - Export your stats under a chosen name
- **Friend Favorites** - Star friends to pin them at the top of the list
- **Friend View Modal** - Click a friend to view their full stats card
- **Prepared for Git sync** - JSON export ready for future remote integration

### User Preferences
- **Favorites** - Mark frequently used exercises (shown first in lists)
- **Unit toggle** - KG or LBS display (all data stored in KG internally)
- **Calibration** - Manually set skill levels when migrating from another tracker (Settings → Calibrate Skills)
- **Last Exercise Inputs** - Remembers weight/reps per exercise between sessions
- **Data reset** - Clear all progress with confirmation

### Data Persistence
- All data saved to browser localStorage
- Keys prefixed with `xpgains_`:

| Key | Description |
|-----|-------------|
| `xpgains_skillXp` | XP values for all 14 skills |
| `xpgains_favorites` | Favorited exercise IDs |
| `xpgains_logEntries` | Training log history |
| `xpgains_settings` | User preferences (units, etc.) |
| `xpgains_challenge` | Current active challenge state |
| `xpgains_lastExerciseInputs` | Last used weight/reps per exercise |
| `xpgains_friends` | Friends list data |
| `xpgains_set_history` | Detailed set records with timestamps (v0.4) |
| `xpgains_lang` | Language code, e.g., "en", "de", "ru" (v0.4) |
| `xpgains_theme` | Theme name: "classic" or "alt" (v0.4) |
| `xpgains_intro_dismissed` | "1" if intro modal dismissed (v0.4) |
| `xpgains_training_plans` | Array of saved workout plans (v0.4) |
| `xpgains_custom_exercises` | Array of user-created exercises (v0.4) |
| `xpgains_equipment_mode` | "1" or "0" for equipment filtering (v0.4) |
| `xpgains_equipment` | Array of available equipment IDs (v0.4) |
| `xpgains_plan_run` | Active plan run state with progress (v0.5) |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vanilla JavaScript (ES6+) |
| Styling | Pure CSS with CSS Variables |
| Icons | Custom PNG skill icons (14 muscles, 5 sizes each) |
| Storage | Browser localStorage |
| Graphics | PNG images with canvas hit-mask detection for muscle map |

### No External Dependencies
- No npm packages
- No build process
- No bundler
- Just open `index.html` in a browser

---

## File Structure

```
G:\XPGains\XPGains ClaudeCode\
├── index.html          # Main HTML structure (~230 lines)
├── app.js              # UI components, state management, event handlers (~3500+ lines)
├── data.js             # Skills, exercises, subcategories, XP formulas, spillover (~800 lines)
├── styles.css          # OSRS-inspired styling with CSS variables (~2000+ lines)
├── translations.js     # i18n dictionaries for 15 languages (~700 lines)
├── manifest.json       # PWA manifest for mobile installation
├── CLAUDE.md           # This file
│
├── assets/
│   ├── Logo/
│   │   ├── XPGains_Logo.png           # Main logo
│   │   └── Alternative/               # Alt logo versions
│   │
│   ├── Muscle Map/
│   │   ├── Muscle_Map_Front.png       # Visible front body image
│   │   ├── Muscle_Map_Back.png        # Visible back body image
│   │   ├── Muscle_Map_Front_Hit.png   # Color-coded hit-mask (front)
│   │   └── Muscle_Map_Back_Hit.png    # Color-coded hit-mask (back)
│   │
│   └── Skill Card Icons/
│       └── v9/XPGains/
│           ├── 256/                   # Source icons (hand-edited)
│           ├── 128/                   # Large icons
│           ├── 64/                    # Standard desktop (used in Stats Card)
│           ├── 48/                    # Mobile size
│           ├── 32/                    # Compact size
│           ├── README.md              # Icon documentation
│           └── icons_reference_sheet.png
│
└── notes/
    └── feedback 24.01.2026.docx       # User feedback document
```

---

## Code Architecture

### app.js Modules

| Module | Purpose |
|--------|---------|
| `AppState` | Global state object (skillXp, favorites, logEntries, settings, training, challenge, lastExerciseInputs, friends, setHistory) |
| `Storage` | localStorage save/load/reset operations (expanded for v0.4 keys) |
| `Units` | Weight conversion and display helpers (kg/lbs) |
| `XpBarColors` | Color interpolation for XP progress bars (red→green gradient) |
| `Navigation` | Tab switching between screens |
| `StatsCard` | Renders the 5x3 skill grid + Total Level tile |
| `SkillDetail` | Modal showing skill level, XP, progress bar |
| `LogScreen` | Renders training history grouped by day + Undo functionality |
| `MuscleMap` | Renders interactive PNG body diagram with hit-mask pixel sampling |
| `TrainingFlow` | Multi-step exercise selection and XP tick (with spillover) |
| `ChallengesScreen` | Random workout quest generator |
| `FriendsScreen` | Friends list, sharing, search, pagination, favorites |
| `SettingsScreen` | User preferences UI (language, theme, equipment mode) |
| `CalibrationModal` | Manual skill level setting for migration |
| `Modal` | Generic modal show/hide system |
| `i18n` | Internationalization: t(), setLanguage(), detectLanguage(), applyRtl() |
| `Theme` | Theme system: init(), apply(), set() |
| `IntroModal` | First-time welcome modal with language selector |
| `TrainingPlans` | Plan CRUD: create, edit, delete, run workout plans |
| `CustomExercises` | Custom exercise CRUD with weight presets and custom XP |
| `EquipmentFilter` | Equipment selection and exercise filtering |
| `StatisticsModal` | Radar chart + muscle change statistics |

### data.js Contents

| Constant | Description |
|----------|-------------|
| `SKILLS` | Array of 14 muscle groups with id, name, icon, bodyRegion |
| `SUBCATEGORIES` | 30 subcategories for exercise grouping (e.g., "Upper Chest", "Long Head") |
| `EXERCISES` | 48 exercises with type, weight config, reference weight, requiredEquipment |
| `XP_CONFIG` | XP calculation parameters (base, growthRate, diminishing multipliers) |
| `XP_TABLE` | Pre-calculated cumulative XP for each level |
| `EXERCISE_SPILLOVER` | Mapping of compound exercises to secondary muscle XP percentages |
| `EQUIPMENT_TYPES` | Array of 9 equipment categories for filtering |

### Key Functions in data.js
- `xpForLevel(level)` - Total XP needed to reach a level
- `levelFromXp(xp)` - Calculate level from XP
- `progressToNextLevel(xp)` - Percentage to next level
- `calculateXpGain(...)` - Full XP calculation with all modifiers
- `isSkillNeglected(skillId, logEntries)` - Check for neglect bonus eligibility
- `getTotalLevel(skillXp)` - Sum of all skill levels (for Stats Card & Friends)
- `getRandomSkills(count, region)` - Get random skills for challenges
- `getRandomExercises(skillId, count)` - Get random exercises for challenges
- `kgToLbs(kg)` / `lbsToKg(lbs)` - Unit conversion

---

## Code Style & Conventions

### JavaScript
- **Module pattern** - Capitalized object names (e.g., `AppState`, `TrainingFlow`)
- **Section comments** - `// ============================================`
- **JSDoc comments** - Function documentation with @param and @returns
- **No semicolons** - Inconsistent usage (some files have them, some don't)
- **Single quotes** - Used for strings
- **camelCase** - Variables and functions
- **UPPER_SNAKE_CASE** - Constants (SKILLS, EXERCISES, XP_CONFIG)

### CSS
- **CSS Variables** - All colors and spacing in `:root`
- **Section comments** - Same style as JS
- **BEM-ish naming** - e.g., `.skill-tile`, `.skill-tile-icon`, `.skill-detail-name`
- **Mobile-first responsive** - Media queries for smaller screens
- **OSRS color palette** - Browns, golds, dark backgrounds

### HTML
- **Semantic structure** - `<nav>`, `<main>`, `<section>`
- **Screen pattern** - Each view is a `<section class="screen">` toggled with `.active`
- **Modal pattern** - `<div class="modal">` with `.active` class for visibility
- **Data attributes** - `data-tab`, `data-skill-id`, `data-exercise-id`

---

## The 14 Skills (Muscle Groups)

### Upper Body (9)
1. **Chest** - Bench press, flys, push-ups
2. **Back - Lats** - Pull-ups, rows, pulldowns
3. **Back - Lower** - Deadlifts, back extensions, good mornings
4. **Traps** - Shrugs, face pulls
5. **Neck** - Neck curls, extensions
6. **Delts** - Overhead press, lateral raises
7. **Biceps** - Curls (barbell, dumbbell, hammer, preacher)
8. **Triceps** - Pushdowns, skull crushers, dips
9. **Forearms** - Wrist curls, farmers walks

### Lower Body (5)
10. **Core** - Crunches, leg raises, planks, Russian twists
11. **Glutes** - Hip thrusts, bridges, kickbacks
12. **Quads** - Squats, leg press, extensions, lunges
13. **Hamstrings** - RDL, leg curls, Nordic curls
14. **Calves** - Standing/seated calf raises

---

## Development Commands

Since this is a pure HTML/CSS/JS project with no build process:

```bash
# Open in browser (Windows)
start index.html

# Or serve with any static server
npx serve .
python -m http.server 8000
```

### Debug Commands (Browser Console)
```javascript
// Reset all data
resetXPGains()

// View current state
console.log(AppState)

// Check XP table
console.log(XP_TABLE)

// Test XP calculation
calculateXpGain(10, 60, 'bench_press', 1, [], false)
```

---

## Known Issues & Limitations

1. **No offline support** - PWA manifest exists but no service worker for offline caching
2. **Single device** - Data doesn't sync between devices
3. **No data export** - Cannot backup or transfer data (Friends share feature is user-by-user)
4. **Session-based diminishing** - Resets on page reload (recentSets not persisted)
5. **No progressive overload tracking** - Weight/rep improvements shown in log but not emphasized
6. **Fixed XP curve** - No way to adjust progression speed
7. **No rest timer** - Must use external timer between sets
8. **Partial translations** - Only German and Russian are complete; other 12 languages fall back to English
9. **Flag emojis** - May show as text (e.g., "GB") on some systems without emoji fonts

---

## TODO / Future Features

### High Priority
- [ ] Data export/import (JSON backup)
- [x] ~~Undo last XP tick~~ (Implemented in v0.3)
- [ ] Persist recentSets across sessions
- [ ] Rest timer between sets
- [ ] Sound effects for level ups

### Medium Priority
- [ ] Progressive overload highlights on Stats Card
- [ ] Weekly/monthly XP graphs
- [ ] Personal records tracking
- [x] ~~Custom exercise creation~~ (Implemented in v0.4)
- [x] ~~Workout templates/routines~~ (Training Plans in v0.4)

### Low Priority
- [x] ~~PWA with offline support~~ (PWA manifest in v0.4, no service worker yet)
- [ ] Cloud sync (optional account)
- [x] ~~Social features (friends, leaderboards)~~ (Friends system in v0.3)
- [ ] Achievement system
- [x] ~~Dark/light theme toggle~~ (Theme system in v0.4)

### Completed in v0.4
- [x] Internationalization (15 languages)
- [x] OS language detection
- [x] Theme system (Classic/Alternative)
- [x] Intro modal for new users
- [x] Training plan builder
- [x] Custom exercises with weight presets
- [x] Equipment filtering
- [x] Spillover XP for compound exercises
- [x] Statistics modal with radar chart
- [x] Set history tracking for analytics

---

## Notes for Future Sessions

### Critical Invariants
1. **Every XP tick must:**
   - Award XP to exactly one parent muscle skill
   - Create one complete log entry
   - Award spillover XP to secondary muscles (for compound exercises)
   - Record to setHistory for statistics
   - Never award XP without logging

2. **Weight storage:**
   - Always store weights in KG internally
   - Convert to/from display unit only at UI boundary

3. **XP curve:**
   - Level 99 requires ~83,000 XP
   - Designed for ~1,200-1,600 quality sets over 6-8 years
   - Do not modify `XP_CONFIG.base` or `XP_CONFIG.growthRate` without recalibrating

4. **i18n system:**
   - All user-facing strings must use `i18n.t('key')` calls
   - Keys follow pattern: `category.subcategory.key`
   - Missing translations fall back to English automatically

### Common Modification Points
- **Add new exercise:** Add to `EXERCISES` array in data.js with weight config, reference weight, and requiredEquipment
- **Add new subcategory:** Add to `SUBCATEGORIES` array, link to skill via `skillId`
- **Change XP balance:** Modify `XP_CONFIG` values in data.js
- **Add new screen:** Create HTML section, add nav tab, add render function to module
- **Add spillover:** Add exercise to `EXERCISE_SPILLOVER` mapping in data.js
- **Add translation:** Add keys to all language objects in translations.js (at minimum add to `en`)
- **Add new language:** Add to `I18N.languages` array and create translation object

### File Dependencies
```
index.html
  └── loads translations.js first (defines I18N object)
  └── then loads data.js (defines SKILLS, EXERCISES, EXERCISE_SPILLOVER, functions)
  └── then loads app.js (uses translations.js and data.js exports)
```

### Icon Mapping
The `iconMap` in `StatsCard.getSkillIcon()` maps skill IDs to icon filenames:
```javascript
chest → skill_chest.png
back_lats → skill_lats.png
back_erector → skill_erectors.png
// ... etc
```

---

## Backup Information

**Backup Location:** `G:\XPGains\backups\`
- `v1/` - First backup
- `v2/` - Previous session backup
- `v3/` - Session backup (January 27, 2026)
- `v4/` - v0.4 implementation (January 28, 2026)
- `v5/` - v0.5 implementation (January 28, 2026)
- `v6/` - v0.06 implementation (January 29, 2026)
- `v7/` - Current v0.07 implementation (January 29, 2026)

---

## Version History

### v0.08 (January 30, 2026)
- **Enhanced Onboarding Animations**:
  - Updated subtitle text: "Select a muscle to train and begin leveling up"
  - Slower text glow wave (5 seconds, letter-by-letter white highlight)
  - Subtle metallic shine effect passes through muscle fill
  - Thinner white outline trace on muscle boundaries
  - No auto-switching views (stays on user's current view)
  - 0.5 second delay before opening training modal to show highlight
  - Animations restart when clicking empty space (if still new user)
- **Challenge System Overhaul**:
  - Renamed "Active Quest" → "Goal"
  - Clickable exercises in challenge view to start training directly
  - Auto-close and return to challenges when target sets completed
  - "Complete Quest!" → "CLAIM XP REWARD" button
  - Challenge bonus XP: 33.3% of total XP gained, awarded to random challenge muscle
  - Updated completion message: "Success! You earned {bonus} XP..."
- **New Bonus Systems**:
  - **Consistency Bonus**: Double XP for 4 ticks when trained 7+ days in last 14 days
  - **Variation Bonus**: 300 XP reward when diversity score > 70%, popup to choose any skill
  - Bonuses module with check/apply/claim functions
- **German Translation Updates**:
  - Nav: "Statistiken" → "Levels", "Muskelkarte" → "Muskelauswahl"
- **Log Improvements**:
  - Removed "▲ Reps up" indicator (kept "Weight up" only)
- **Meta/PWA Updates**:
  - Description changed to "Earn XP from your workouts and level up"

### v0.07 (January 29, 2026)
- **New User Onboarding Animations**:
  - Text glow wave animation on "Select a muscle to train" subtitle
  - Animated muscle outline effect cycles through random muscles
  - Uses hit-mask edge detection to highlight muscle boundaries
  - Traveling glow wave effect circles each muscle's outline
  - Theme-aware colors (orange for Classic, purple for Mithril)
  - 3.5-second cycle per muscle with fade transitions
  - Auto-switches between front/back views to showcase different muscles
  - Animations stop permanently when user clicks on any muscle
  - Only activates for new users (Total Level = 14)

### v0.06 (January 29, 2026)
- **New Muscle Map System**:
  - Replaced SVG polygon regions with PNG hit-mask pixel sampling
  - Accurate muscle detection using color-coded hit-mask images
  - Proper coordinate mapping for object-fit: contain layout
  - Subtle highlight overlay (theme-aware: orange/purple)
  - Front/Back toggle with separate hit-masks per view
  - Click on empty space clears selection
- **Theme Renamed**: "Alternative" → "Mithril"
  - Theme names kept in English across all languages
  - Increased icon saturation in Mithril theme (grayscale 0.5, saturate 0.5)
- **Russian Language Improvements**:
  - "Карта мышц" → "Обзор Мышц" (nav and title)
  - "Испытания" → "Задачи" (challenges tab)
  - Mithril theme auto-selected for Russian browser language
- **Intro Modal Redesign**:
  - Simplified to 3 steps without numbering
  - Added theme toggle (Classic/Mithril) in welcome screen
  - "Got it" → "Get Started" button text
  - Full black background for cleaner presentation
  - More spacing between instruction steps
- **Settings Update**:
  - Version: v0.06
  - Tagline: "Track your progress"
  - Added copyright: © 2026 Gerbert Guliyev. All rights reserved.

### v0.05 (January 28, 2026)
- **Log Entry Spillover XP Display**:
  - Moved passive/spillover XP from below exercise name to right side
  - Displayed in green with "XP" label and muscle name below
  - Consistent format with main XP display
- **Alternative Theme Complete Redesign** (Dark Charcoal + Purple):
  - New palette: near-black charcoal backgrounds (#121316, #1A1C21)
  - Muted purple accents (#6B5BD6) replacing all brown/tan
  - Subtle borders (#2E323C) - no bright contrasts
  - Modern, neutral, readable appearance
  - All UI elements updated: modals, inputs, cards, buttons
- **Icon Desaturation Fix**:
  - Icons now desaturated by DEFAULT in Alternative theme
  - Hover state slightly increases saturation for feedback
  - Fixed selector to apply to base state, not just :hover
- **Action Button Color Overhaul**:
  - Alternative theme: Muted purple primary buttons
  - Classic theme: OSRS-style yellow/gold primary buttons
  - No more green action buttons in either theme
  - Consistent styling across all screens/modals

### v0.5 (January 28, 2026)
- **Training Plan Run Mode** - Full guided workout progression:
  - Linear flow through plan exercises with set tracking
  - Navigation controls (Previous/Next) to move between exercises
  - Auto-advance when target sets are completed
  - Plan completion summary with per-exercise stats
  - Persistent state survives page refresh (resume on reload)
  - Skip confirmation for incomplete exercises
- **Plan UI Improvements**:
  - Redesigned plan card layout with better typography
  - Improved plan editor with proper item row styling
  - Consistent button sizing and spacing
- **iOS Home Screen Icon Fix**:
  - Added multiple apple-touch-icon sizes (120, 167, 180)
  - Added 192x192 and 512x512 icons for PWA compliance
  - Updated manifest.json with proper icon configuration
  - Added additional PWA meta tags

### v0.4 (January 28, 2026)
- Added internationalization with 15 languages (German, Russian complete)
- Added OS language auto-detection
- Added theme system (Classic/Alternative)
- Added intro modal with language selector
- Added PWA manifest for mobile installation
- Added training plan builder
- Added custom exercise creation with weight presets
- Added equipment filtering
- Added spillover XP for compound exercises (silent awards)
- Added statistics modal with SVG radar chart
- Added set history tracking for analytics
- Fixed muscle map responsive scaling
- Added text wrapping for skill labels
- Prevented browser auto-translation interference

### v0.3 (January 27, 2026)
- Added Friends system with sharing and favorites
- Added undo functionality for log entries
- Added calibration modal for skill migration

### v0.2
- Added challenges/quests system
- Added XP toast notifications
- Added neglected muscle bonus

### v0.1
- Initial release with core training flow
- Muscle map, stats card, training log

---

*Last updated: January 29, 2026 (v0.07)*
*Created by: Claude Code*
*© 2026 Gerbert Guliyev. All rights reserved.*
