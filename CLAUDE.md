# XPGains - Claude Code Context

## Project Overview

**XPGains** is a gamified fitness tracker inspired by Old School RuneScape (OSRS). It transforms strength training into an RPG-like experience where 14 muscle groups are treated as "skills" that can be leveled from 1 to 99 through consistent training.

The app rewards users with XP for logging workout sets, calculated based on weight lifted, reps performed, and exercise type. The visual design mimics OSRS's distinctive aesthetic, including the characteristic skill card grid layout.

**Current Version:** v0.2

---

## Current Feature List

### Core Features
- **Muscle Map** - Interactive SVG body diagram for selecting muscles to train
- **Stats Card** - OSRS-style 5x3 grid displaying all 14 muscle skills with current/max levels
- **Training Flow** - Muscle selection → Exercise selection → Weight/Reps input → XP award
- **Training Log** - Complete history of logged sets, grouped by day with XP totals
- **XP Toast** - Visual feedback showing XP gained after each set

### XP System
- **Geometric progression** - Calibrated for 6-8 years to max a skill at baseline volume
- **Level cap** - 99 per skill (1,386 total across all 14 skills)
- **Base XP values** - Compound exercises: 50 XP, Isolation: 35 XP
- **Reps factor** - Scales from 0.6x to 2.0x based on rep count
- **Intensity factor** - Scales based on weight vs reference weight (0.7x to 1.6x)

### Bonus Systems
- **Neglected Muscle Bonus** - +10% XP for muscles not trained in 7+ days (only if previously trained)
- **Diminishing Returns** - Reduced XP for repeated same-weight sets (session-based)
- **Grace period** - Increases with skill level (1 + floor(level/15))

### Challenges/Quests
- **Short** - 1 muscle, 1 exercise, 4 sets
- **Regular** - 2 muscles, 3 exercises each, 3-4 sets per exercise
- **Ironman** - 3 muscles, 4 exercises each, 4 sets per exercise
- Body focus options: Full Random, Upper Body, Lower Body

### User Preferences
- **Favorites** - Mark frequently used exercises (shown first in lists)
- **Unit toggle** - KG or LBS display (all data stored in KG internally)
- **Data reset** - Clear all progress with confirmation

### Data Persistence
- All data saved to browser localStorage
- Keys prefixed with `xpgains_` (skillXp, favorites, logEntries, settings, challenge)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vanilla JavaScript (ES6+) |
| Styling | Pure CSS with CSS Variables |
| Icons | Custom PNG skill icons (14 muscles, 5 sizes each) |
| Storage | Browser localStorage |
| Graphics | Inline SVG for muscle map |

### No External Dependencies
- No npm packages
- No build process
- No bundler
- Just open `index.html` in a browser

---

## File Structure

```
G:\XPGains\XPGains ClaudeCode\
├── index.html          # Main HTML structure (111 lines)
├── app.js              # UI components, state management, event handlers (~1100 lines)
├── data.js             # Skills, exercises, subcategories, XP formulas (~600 lines)
├── styles.css          # OSRS-inspired styling with CSS variables (~1270 lines)
├── CLAUDE.md           # This file
│
├── assets/
│   ├── Logo/
│   │   ├── XPGains_Logo.png           # Main logo
│   │   └── Alternative/               # Alt logo versions
│   │
│   ├── Muscle Map/
│   │   └── muscle map new.jpeg        # Reference image
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
| `AppState` | Global state object (skillXp, favorites, logEntries, settings, training, challenge) |
| `Storage` | localStorage save/load/reset operations |
| `Units` | Weight conversion and display helpers (kg/lbs) |
| `Navigation` | Tab switching between screens |
| `StatsCard` | Renders the 5x3 skill grid |
| `SkillDetail` | Modal showing skill level, XP, progress bar |
| `LogScreen` | Renders training history grouped by day |
| `MuscleMap` | Renders interactive SVG body diagram |
| `TrainingFlow` | Multi-step exercise selection and XP tick |
| `ChallengesScreen` | Random workout quest generator |
| `SettingsScreen` | User preferences UI |
| `Modal` | Generic modal show/hide system |

### data.js Contents

| Constant | Description |
|----------|-------------|
| `SKILLS` | Array of 14 muscle groups with id, name, icon, bodyRegion |
| `SUBCATEGORIES` | 30 subcategories for exercise grouping (e.g., "Upper Chest", "Long Head") |
| `EXERCISES` | 50+ exercises with type, weight config, reference weight |
| `XP_CONFIG` | XP calculation parameters (base, growthRate, diminishing multipliers) |
| `XP_TABLE` | Pre-calculated cumulative XP for each level |

### Key Functions in data.js
- `xpForLevel(level)` - Total XP needed to reach a level
- `levelFromXp(xp)` - Calculate level from XP
- `progressToNextLevel(xp)` - Percentage to next level
- `calculateXpGain(...)` - Full XP calculation with all modifiers
- `isSkillNeglected(skillId, logEntries)` - Check for neglect bonus eligibility
- `getTotalLevel(skillXp)` - Sum of all skill levels
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

1. **No offline support** - Requires localStorage; no service worker
2. **Single device** - Data doesn't sync between devices
3. **No data export** - Cannot backup or transfer data
4. **No undo** - Accidental XP ticks cannot be reversed
5. **Session-based diminishing** - Resets on page reload (recentSets not persisted)
6. **No progressive overload tracking** - Weight/rep improvements shown in log but not emphasized
7. **Fixed XP curve** - No way to adjust progression speed
8. **No rest timer** - Must use external timer between sets

---

## TODO / Future Features

### High Priority
- [ ] Data export/import (JSON backup)
- [ ] Undo last XP tick
- [ ] Persist recentSets across sessions
- [ ] Rest timer between sets
- [ ] Sound effects for level ups

### Medium Priority
- [ ] Progressive overload highlights on Stats Card
- [ ] Weekly/monthly XP graphs
- [ ] Personal records tracking
- [ ] Custom exercise creation
- [ ] Workout templates/routines

### Low Priority
- [ ] PWA with offline support
- [ ] Cloud sync (optional account)
- [ ] Social features (friends, leaderboards)
- [ ] Achievement system
- [ ] Dark/light theme toggle

---

## Notes for Future Sessions

### Critical Invariants
1. **Every XP tick must:**
   - Award XP to exactly one parent muscle skill
   - Create one complete log entry
   - Never award XP without logging

2. **Weight storage:**
   - Always store weights in KG internally
   - Convert to/from display unit only at UI boundary

3. **XP curve:**
   - Level 99 requires ~83,000 XP
   - Designed for ~1,200-1,600 quality sets over 6-8 years
   - Do not modify `XP_CONFIG.base` or `XP_CONFIG.growthRate` without recalibrating

### Common Modification Points
- **Add new exercise:** Add to `EXERCISES` array in data.js with weight config and reference weight
- **Add new subcategory:** Add to `SUBCATEGORIES` array, link to skill via `skillId`
- **Change XP balance:** Modify `XP_CONFIG` values in data.js
- **Add new screen:** Create HTML section, add nav tab, add render function to module

### File Dependencies
```
index.html
  └── loads data.js first (defines SKILLS, EXERCISES, functions)
  └── then loads app.js (uses data.js exports)
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
- `v2/` - Current session backup (created at start of this session)

---

*Last updated: January 27, 2026*
*Created by: Claude Code*
