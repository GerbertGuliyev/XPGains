# XPGains Data Model

## Overview

This document describes the data model for XPGains, including the client-side GameState and server-side database schema.

## Client-Side State (GameState)

```typescript
interface GameState {
  schemaVersion: number;      // For migrations

  profile: {
    localUserId: string;      // UUID (client-generated)
    displayName?: string;
    createdAt: string;        // ISO timestamp
  };

  body?: {
    heightCm?: number;
    weightKg?: number;
    bodyFatPercent?: number;
    age?: number;
    sex?: 'male' | 'female' | 'other';
  };

  stats: {
    skillXp: Record<SkillId, number>;  // XP per skill
  };

  progress: {
    activeProgramId?: string;
    currentDay?: number;
    streakCount?: number;
    lastWorkoutAt?: string;
  };

  history: {
    workoutSessions: WorkoutSession[];
    xpEvents: XpEvent[];
  };

  settings: UserSettings;
  favorites: Record<string, boolean>;
  customExercises: CustomExercise[];
  trainingPlans: TrainingPlan[];
  equipment: { enabled: boolean; available: EquipmentId[] };
  challenge?: Challenge;

  meta: {
    lastModifiedAt: string;
    lastSyncAt?: string;
    pendingSync: boolean;
  };
}
```

## Skills (14 Muscle Groups)

| ID | Name | Body Region |
|----|------|-------------|
| `chest` | Chest | Upper |
| `back_lats` | Back – Lats | Upper |
| `back_erector` | Back – Lower | Upper |
| `traps` | Traps | Upper |
| `neck` | Neck | Upper |
| `delts` | Delts | Upper |
| `biceps` | Biceps | Upper |
| `triceps` | Triceps | Upper |
| `forearms` | Forearms | Upper |
| `core` | Core | Lower |
| `glutes` | Glutes | Lower |
| `quads` | Quads | Lower |
| `hamstrings` | Hamstrings | Lower |
| `calves` | Calves | Lower |

## XP System

### Level Progression

```
XP to next level = 150 × 1.03^(level-1)

Level 1→2: 150 XP
Level 2→3: 155 XP
Level 3→4: 159 XP
...
Level 98→99: ~717 XP

Total XP for Level 99: ~83,000 XP
```

### XP Calculation

```
XP = BaseXP × RepsFactor × IntensityFactor × Diminishing × NeglectedBonus

BaseXP:
  - Compound: 50
  - Isolation: 35

RepsFactor: clamp(reps / 10, 0.6, 2.0)
  - 6 reps = 0.6×
  - 10 reps = 1.0×
  - 20 reps = 2.0×

IntensityFactor: clamp(√(weight / refWeight), 0.7, 1.6)
  - Bodyweight exercises: 1.0×

Diminishing Returns:
  - Grace period: 1 + floor(level / 15)
  - Multipliers: [1.0, 0.85, 0.7, 0.5, 0.3]

NeglectedBonus: 1.1× if muscle not trained in 7+ days
```

### Spillover XP

Compound exercises award bonus XP to secondary muscles:

| Exercise | Spillover |
|----------|-----------|
| Bench Press | Triceps 15%, Delts 10% |
| Squat | Glutes 25%, Hams 15%, Core 10%, Erector 5% |
| Deadlift | Glutes 25%, Hams 20%, Quads 10%, Forearms 10%, Traps 10% |
| Pull Ups | Biceps 20%, Forearms 10% |

## Server-Side Schema

### Tables

```sql
-- User profile (extends auth.users)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  display_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Physical measurements
user_body (
  user_id UUID PRIMARY KEY,
  height_cm INTEGER,
  weight_kg NUMERIC,
  body_fat_percent NUMERIC,
  age INTEGER,
  sex TEXT
)

-- Cached skill XP (derived from xp_events)
user_stats (
  user_id UUID PRIMARY KEY,
  skill_xp JSONB,  -- { "chest": 1500, "biceps": 800, ... }
  updated_at TIMESTAMPTZ
)

-- Workout records
workout_sessions (
  id UUID PRIMARY KEY,  -- Client-generated
  user_id UUID,
  completed_at TIMESTAMPTZ,
  total_xp_earned INTEGER,
  exercises JSONB,      -- Array of exercise data
  duration_seconds INTEGER
)

-- XP change log (immutable)
xp_events (
  id UUID PRIMARY KEY,
  user_id UUID,
  client_event_id TEXT,  -- For deduplication
  source_session_id UUID,
  skill_id TEXT,
  type TEXT,            -- 'workout', 'spillover', 'bonus', 'manual'
  amount INTEGER,
  created_at TIMESTAMPTZ,
  UNIQUE(user_id, client_event_id)
)

-- User preferences
user_settings (
  user_id UUID PRIMARY KEY,
  unit TEXT,           -- 'kg' or 'lbs'
  theme TEXT,
  language TEXT,
  equipment_enabled BOOLEAN,
  equipment_available TEXT[]
)

-- Custom exercises
custom_exercises (
  id UUID PRIMARY KEY,
  user_id UUID,
  exercise_id TEXT,    -- Client-generated ID
  name TEXT,
  skill_id TEXT,
  type TEXT,
  weight_config JSONB,
  reference_weight NUMERIC,
  xp_mode TEXT,
  custom_xp_per_set INTEGER
)

-- Training plans
training_plans (
  id UUID PRIMARY KEY,
  user_id UUID,
  plan_id TEXT,        -- Client-generated ID
  name TEXT,
  items JSONB          -- Array of plan items
)

-- Favorited exercises
favorites (
  user_id UUID,
  exercise_id TEXT,
  PRIMARY KEY(user_id, exercise_id)
)
```

## Data Relationships

```
auth.users
    │
    ├──► profiles (1:1)
    ├──► user_body (1:1)
    ├──► user_stats (1:1)
    ├──► user_settings (1:1)
    │
    ├──► workout_sessions (1:many)
    │         │
    │         └──► xp_events (1:many)
    │
    ├──► custom_exercises (1:many)
    ├──► training_plans (1:many)
    └──► favorites (1:many)
```

## Migrations

State migrations are handled in `@xpgains/core/persistence/migrations.ts`:

1. Detect schema version
2. Apply incremental migrations
3. Validate and normalize result

Example migration (v0 → v1):
- Convert flat localStorage keys to nested GameState
- Normalize skill XP structure
- Create profile and meta objects
