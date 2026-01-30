# XPGains Full Rebuild - Implementation Plan

## Overview

This document outlines the complete rebuild of XPGains from a vanilla JavaScript web app to a mobile-first Expo React Native application with Supabase backend.

**Current State**: Vanilla JS web app with localStorage persistence
**Target State**: React Native Expo app with offline-first sync to Supabase

---

## Phase 0: Audit & Port (Domain Extraction)

### 0.1 Domain Concepts to Extract

#### XP System
| Component | Formula/Logic |
|-----------|---------------|
| Base XP | Compound: 50, Isolation: 35 |
| Reps Factor | `clamp(reps / 10, 0.6, 2.0)` |
| Intensity Factor | `clamp(sqrt(weight / referenceWeight), 0.7, 1.6)` |
| Diminishing Returns | Grace period: `1 + floor(level / 15)`, multipliers: [1.0, 0.85, 0.7, 0.5, 0.3] |
| Neglected Bonus | +10% if not trained in 7+ days |

#### Level Progression
| Component | Formula |
|-----------|---------|
| XP to Next Level | `150 × 1.03^(level-1)` |
| Level from XP | Binary search through XP_TABLE |
| Level Cap | 99 per skill |

#### Skills (14 Muscle Groups)
- Upper Body (9): chest, back_lats, back_erector, traps, neck, delts, biceps, triceps, forearms
- Lower Body (5): core, glutes, quads, hamstrings, calves

#### Exercises (48 Standard)
- Each has: id, skillId, type, weight config, referenceWeight, requiredEquipment
- Spillover XP mapping for compound exercises

### 0.2 Files to Port
| Source File | Target | Contents |
|-------------|--------|----------|
| `data.js` | `packages/core/src/data/` | Skills, exercises, XP config, spillover |
| `app.js` (domain parts) | `packages/core/src/domain/` | XP calculation, level logic, state mutations |

---

## Phase 1: Domain Model & Local Persistence

### 1.1 Core Package Structure

```
packages/core/
├── src/
│   ├── data/
│   │   ├── skills.ts          # 14 muscle groups
│   │   ├── exercises.ts       # 48 standard exercises
│   │   ├── equipment.ts       # 9 equipment types
│   │   ├── xpConfig.ts        # XP calculation constants
│   │   └── spillover.ts       # Compound exercise spillover mapping
│   │
│   ├── domain/
│   │   ├── xp.ts              # XP calculation functions
│   │   ├── levels.ts          # Level progression functions
│   │   ├── workout.ts         # Workout completion logic
│   │   ├── state.ts           # GameState type & mutations
│   │   └── challenges.ts      # Challenge generation
│   │
│   ├── persistence/
│   │   ├── types.ts           # Storage adapter interface
│   │   ├── migrations.ts      # State schema migrations
│   │   └── serialization.ts   # State serialization helpers
│   │
│   ├── sync/
│   │   ├── types.ts           # Sync event types
│   │   ├── reconcile.ts       # State reconciliation logic
│   │   └── idempotency.ts     # Deduplication helpers
│   │
│   └── index.ts               # Public API exports
│
├── __tests__/
│   ├── xp.test.ts
│   ├── levels.test.ts
│   └── workout.test.ts
│
├── package.json
└── tsconfig.json
```

### 1.2 GameState Schema (v1)

```typescript
interface GameState {
  schemaVersion: 1;

  profile: {
    localUserId: string;       // UUID generated client-side
    displayName?: string;
    createdAt: string;         // ISO timestamp
  };

  body?: {
    heightCm?: number;
    weightKg?: number;
    bodyFatPercent?: number;
    age?: number;
    sex?: 'male' | 'female' | 'other';
  };

  stats: {
    // Per-skill XP (stored as XP, level derived)
    skillXp: Record<SkillId, number>;
  };

  progress: {
    activeProgramId?: string;
    currentDay?: number;
    streakCount?: number;
    lastWorkoutAt?: string;    // ISO timestamp
  };

  history: {
    workoutSessions: WorkoutSession[];
    xpEvents: XpEvent[];
  };

  settings: {
    unit: 'kg' | 'lbs';
    theme: 'classic' | 'mithril';
    language: string;
  };

  favorites: Record<string, boolean>;  // exerciseId -> true

  customExercises: CustomExercise[];

  trainingPlans: TrainingPlan[];

  equipment: {
    enabled: boolean;
    available: string[];       // Equipment IDs
  };

  meta: {
    lastModifiedAt: string;    // ISO timestamp
    lastSyncAt?: string;       // ISO timestamp (null = never synced)
    pendingSync: boolean;      // Has unsynced changes
  };
}

interface WorkoutSession {
  id: string;                  // UUID (client-generated for idempotency)
  completedAt: string;         // ISO timestamp
  programId?: string;
  workoutId?: string;
  exercises: WorkoutExercise[];
  totalXpEarned: number;
  durationSeconds?: number;
}

interface WorkoutExercise {
  exerciseId: string;
  skillId: string;
  sets: WorkoutSet[];
}

interface WorkoutSet {
  reps: number;
  weightKg: number;
  xpEarned: number;
  spillover?: SpilloverXp[];
}

interface SpilloverXp {
  skillId: string;
  xp: number;
}

interface XpEvent {
  id: string;                  // UUID (client-generated)
  clientEventId: string;       // For deduplication on server
  sourceSessionId: string;     // Links to WorkoutSession.id
  skillId: string;
  type: 'workout' | 'spillover' | 'bonus' | 'manual';
  amount: number;
  createdAt: string;           // ISO timestamp
  meta?: Record<string, unknown>;
}

interface CustomExercise {
  id: string;                  // "custom_" + timestamp
  name: string;
  skillId: string;
  type: 'compound' | 'isolation' | 'bodyweight';
  weight: WeightConfig;
  referenceWeight: number;
  xpMode: 'standard' | 'custom';
  customXpPerSet?: number;
}

interface TrainingPlan {
  id: string;
  name: string;
  items: PlanItem[];
  createdAt: string;
  updatedAt: string;
}

interface PlanItem {
  skillId: string;
  exerciseId: string;
  targetSets?: number;
  targetReps?: number;
  targetWeightKg?: number;
}
```

### 1.3 Key Domain Functions

```typescript
// XP Calculation
function calculateXpGain(params: {
  reps: number;
  weightKg: number;
  exercise: Exercise;
  skillLevel: number;
  recentSets: RecentSet[];
  isNeglected: boolean;
}): number;

// Level Functions
function xpForLevel(level: number): number;
function levelFromXp(xp: number): number;
function progressToNextLevel(xp: number): number; // 0-100

// State Mutations
function applyXpEvent(state: GameState, event: XpEvent): GameState;
function completeWorkout(
  state: GameState,
  sessionInput: WorkoutSessionInput
): {
  newState: GameState;
  session: WorkoutSession;
  xpEvents: XpEvent[];
};

// Helpers
function isSkillNeglected(skillId: string, history: XpEvent[], daysThreshold?: number): boolean;
function getSpilloverXp(exerciseId: string, parentXp: number): SpilloverXp[];
function getTotalLevel(skillXp: Record<string, number>): number;
```

### 1.4 Storage Adapter Interface

```typescript
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

// Implementation will be injected from mobile app
// Uses AsyncStorage on React Native
```

---

## Phase 2: Expo Mobile App

### 2.1 App Structure

```
apps/mobile/
├── app/
│   ├── _layout.tsx            # Root layout with providers
│   ├── index.tsx              # Redirect to main
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Tab navigator
│   │   ├── index.tsx          # Home (stats overview)
│   │   ├── workout.tsx        # Workout selection
│   │   ├── log.tsx            # Training history
│   │   └── settings.tsx       # Settings
│   └── modals/
│       ├── skill-detail.tsx
│       └── workout-session.tsx
│
├── components/
│   ├── StatsCard.tsx
│   ├── SkillTile.tsx
│   ├── XpBar.tsx
│   └── WorkoutList.tsx
│
├── hooks/
│   ├── useGameState.ts        # Zustand store hook
│   └── useSync.ts             # Sync status hook
│
├── store/
│   ├── gameStore.ts           # Zustand store
│   └── asyncStorageAdapter.ts # Storage adapter implementation
│
├── services/
│   ├── supabase.ts            # Supabase client
│   └── sync.ts                # Sync service
│
├── app.json
├── package.json
└── tsconfig.json
```

### 2.2 Minimal Screens (Phase 2)

1. **Splash/Loading** - Initialize state, show loading
2. **Home** - Level, XP bar, stats grid (14 skills)
3. **Workout List** - Static exercise list by muscle
4. **Workout Input** - Reps/weight input + complete button

### 2.3 State Management

Using Zustand with persistence:

```typescript
interface GameStore {
  state: GameState;
  isLoading: boolean;

  // Actions
  loadState: () => Promise<void>;
  completeSet: (input: SetInput) => void;
  completeWorkout: (input: WorkoutInput) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}
```

---

## Phase 3: Supabase Auth + Database

### 3.1 Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User body metrics
CREATE TABLE user_body (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  height_cm INTEGER,
  weight_kg NUMERIC(5,2),
  body_fat_percent NUMERIC(4,1),
  age INTEGER,
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats (derived from XP events, but cached for performance)
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_xp JSONB NOT NULL DEFAULT '{}',  -- { skillId: xp }
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program enrollments
CREATE TABLE program_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  current_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program_id, status)  -- One active enrollment per program
);

-- Workout sessions (source of truth for workouts)
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY,  -- Client-generated for idempotency
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT,
  workout_id TEXT,
  completed_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER,
  total_xp_earned INTEGER NOT NULL,
  exercises JSONB NOT NULL,  -- Array of exercise data
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- XP events (immutable log of all XP changes)
CREATE TABLE xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_event_id TEXT NOT NULL,  -- For deduplication
  source_session_id UUID REFERENCES workout_sessions(id),
  skill_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workout', 'spillover', 'bonus', 'manual')),
  amount INTEGER NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, client_event_id)  -- Prevents duplicate XP
);

-- User settings
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  unit TEXT DEFAULT 'kg' CHECK (unit IN ('kg', 'lbs')),
  theme TEXT DEFAULT 'classic',
  language TEXT DEFAULT 'en',
  equipment_enabled BOOLEAN DEFAULT FALSE,
  equipment_available TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom exercises
CREATE TABLE custom_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,  -- "custom_" + timestamp (from client)
  name TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('compound', 'isolation', 'bodyweight')),
  weight_config JSONB NOT NULL,
  reference_weight NUMERIC(5,2),
  xp_mode TEXT DEFAULT 'standard' CHECK (xp_mode IN ('standard', 'custom')),
  custom_xp_per_set INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- Training plans
CREATE TABLE training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,  -- Client-generated ID
  name TEXT NOT NULL,
  items JSONB NOT NULL,  -- Array of plan items
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- Favorites
CREATE TABLE favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(user_id, exercise_id)
);

-- Indexes for performance
CREATE INDEX idx_workout_sessions_user ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_completed ON workout_sessions(user_id, completed_at DESC);
CREATE INDEX idx_xp_events_user ON xp_events(user_id);
CREATE INDEX idx_xp_events_skill ON xp_events(user_id, skill_id);
CREATE INDEX idx_xp_events_created ON xp_events(user_id, created_at DESC);
```

### 3.2 RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_body ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User body: Users can only access their own data
CREATE POLICY "Users can manage own body data" ON user_body
  FOR ALL USING (auth.uid() = user_id);

-- User stats: Users can only access their own stats
CREATE POLICY "Users can manage own stats" ON user_stats
  FOR ALL USING (auth.uid() = user_id);

-- Program enrollments: Users can only access their own enrollments
CREATE POLICY "Users can manage own enrollments" ON program_enrollments
  FOR ALL USING (auth.uid() = user_id);

-- Workout sessions: Users can only access their own sessions
CREATE POLICY "Users can manage own sessions" ON workout_sessions
  FOR ALL USING (auth.uid() = user_id);

-- XP events: Users can only access their own events
CREATE POLICY "Users can manage own xp events" ON xp_events
  FOR ALL USING (auth.uid() = user_id);

-- User settings: Users can only access their own settings
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Custom exercises: Users can only access their own exercises
CREATE POLICY "Users can manage own custom exercises" ON custom_exercises
  FOR ALL USING (auth.uid() = user_id);

-- Training plans: Users can only access their own plans
CREATE POLICY "Users can manage own plans" ON training_plans
  FOR ALL USING (auth.uid() = user_id);

-- Favorites: Users can only access their own favorites
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);
```

### 3.3 Database Functions

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);

  INSERT INTO user_stats (user_id, skill_xp)
  VALUES (NEW.id, '{}');

  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to recalculate user stats from XP events
CREATE OR REPLACE FUNCTION recalculate_user_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_skill_xp JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_object_agg(skill_id, total_xp),
    '{}'::jsonb
  )
  INTO v_skill_xp
  FROM (
    SELECT skill_id, SUM(amount)::INTEGER as total_xp
    FROM xp_events
    WHERE user_id = p_user_id
    GROUP BY skill_id
  ) sub;

  INSERT INTO user_stats (user_id, skill_xp, updated_at)
  VALUES (p_user_id, v_skill_xp, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET skill_xp = v_skill_xp, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Phase 4: Sync Strategy

### 4.1 Sync Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ GameStore   │◄──►│ SyncService │◄──►│ Supabase    │    │
│  │ (Zustand)   │    │             │    │ Client      │    │
│  └──────┬──────┘    └─────────────┘    └─────────────┘    │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │ AsyncStorage│  ← Local persistence (offline)            │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ Auth        │    │ Database    │    │ RLS         │    │
│  │ (email/pw)  │    │ (Postgres)  │    │ Policies    │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Sync Flow

#### Login Flow
```typescript
async function handleLogin(credentials: Credentials): Promise<void> {
  // 1. Authenticate with Supabase
  const { user } = await supabase.auth.signInWithPassword(credentials);

  // 2. Load local state
  const localState = await loadLocalState();

  // 3. Check if server has data
  const serverStats = await supabase.from('user_stats').select().single();

  if (!serverStats.data?.skill_xp || Object.keys(serverStats.data.skill_xp).length === 0) {
    // 4a. Server empty, local has data → Import local to server
    if (localState && hasProgress(localState)) {
      await importLocalToServer(localState, user.id);
    }
  } else {
    // 4b. Server has data → Pull and rebuild local
    const serverState = await pullServerState(user.id);
    await saveLocalState(serverState);
    store.setState({ state: serverState });
  }
}
```

#### Push Flow (After Local Changes)
```typescript
async function pushChanges(changes: {
  sessions: WorkoutSession[];
  xpEvents: XpEvent[];
}): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return; // Guest mode, no push

  // Push workout sessions (idempotent via ID)
  for (const session of changes.sessions) {
    await supabase.from('workout_sessions').upsert({
      id: session.id,
      user_id: userId,
      ...sessionToRow(session)
    });
  }

  // Push XP events (deduplicated via client_event_id)
  for (const event of changes.xpEvents) {
    await supabase.from('xp_events').upsert({
      user_id: userId,
      client_event_id: event.clientEventId,
      ...eventToRow(event)
    }, { onConflict: 'user_id,client_event_id' });
  }

  // Recalculate stats on server
  await supabase.rpc('recalculate_user_stats', { p_user_id: userId });
}
```

#### Pull Flow (Sync from Server)
```typescript
async function pullServerState(userId: string): Promise<GameState> {
  const [stats, sessions, events, settings, plans, exercises, favorites] = await Promise.all([
    supabase.from('user_stats').select().eq('user_id', userId).single(),
    supabase.from('workout_sessions').select().eq('user_id', userId),
    supabase.from('xp_events').select().eq('user_id', userId),
    supabase.from('user_settings').select().eq('user_id', userId).single(),
    supabase.from('training_plans').select().eq('user_id', userId),
    supabase.from('custom_exercises').select().eq('user_id', userId),
    supabase.from('favorites').select().eq('user_id', userId),
  ]);

  return buildGameStateFromServerData({
    stats: stats.data,
    sessions: sessions.data,
    events: events.data,
    settings: settings.data,
    plans: plans.data,
    exercises: exercises.data,
    favorites: favorites.data,
  });
}
```

### 4.3 Idempotency Strategy

```typescript
// Client generates IDs for deduplication
function generateWorkoutSessionId(): string {
  return `session_${Date.now()}_${randomUUID()}`;
}

function generateXpEventId(sessionId: string, skillId: string, index: number): string {
  return `${sessionId}_${skillId}_${index}`;
}

// Server uses UNIQUE constraint on (user_id, client_event_id)
// Duplicate inserts are silently ignored (ON CONFLICT DO NOTHING)
```

---

## Phase 5: Testing Strategy

### 5.1 Core Domain Tests

```typescript
// packages/core/__tests__/xp.test.ts
describe('XP Calculation', () => {
  it('calculates base XP correctly for compound exercises', () => {
    const xp = calculateXpGain({
      reps: 10,
      weightKg: 80,
      exercise: EXERCISES.bench_press,
      skillLevel: 1,
      recentSets: [],
      isNeglected: false,
    });
    expect(xp).toBe(50); // Base XP for compound
  });

  it('applies reps factor correctly', () => {
    // 6 reps = 0.6x
    const xp6 = calculateXpGain({ reps: 6, ... });
    // 20 reps = 2.0x
    const xp20 = calculateXpGain({ reps: 20, ... });
    expect(xp20 / xp6).toBeCloseTo(2.0 / 0.6, 1);
  });

  it('applies neglected bonus correctly', () => {
    const normal = calculateXpGain({ isNeglected: false, ... });
    const neglected = calculateXpGain({ isNeglected: true, ... });
    expect(neglected).toBe(Math.round(normal * 1.1));
  });
});

// packages/core/__tests__/levels.test.ts
describe('Level Progression', () => {
  it('level 1 requires 0 XP', () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it('level 2 requires 150 XP', () => {
    expect(xpForLevel(2)).toBe(150);
  });

  it('correctly calculates level from XP', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(149)).toBe(1);
    expect(levelFromXp(150)).toBe(2);
  });

  it('caps at level 99', () => {
    expect(levelFromXp(1000000)).toBe(99);
  });
});

// packages/core/__tests__/workout.test.ts
describe('Workout Completion', () => {
  it('generates correct XP events for a workout', () => {
    const initialState = createInitialState();
    const { newState, xpEvents } = completeWorkout(initialState, {
      exercises: [
        { exerciseId: 'bench_press', sets: [{ reps: 10, weightKg: 60 }] }
      ]
    });

    expect(xpEvents.length).toBeGreaterThan(0);
    expect(newState.stats.skillXp.chest).toBeGreaterThan(initialState.stats.skillXp.chest);
  });

  it('does not double-count XP on replay', () => {
    const state = createInitialState();
    const { newState: state1, xpEvents } = completeWorkout(state, workout);

    // Replay same events
    const state2 = xpEvents.reduce(
      (s, e) => applyXpEvent(s, e),
      state
    );

    expect(state1.stats.skillXp).toEqual(state2.stats.skillXp);
  });
});
```

---

## Deliverables Checklist

### Phase 0
- [ ] `/packages/core/src/data/skills.ts` - 14 muscle groups
- [ ] `/packages/core/src/data/exercises.ts` - 48 exercises
- [ ] `/packages/core/src/data/equipment.ts` - 9 equipment types
- [ ] `/packages/core/src/data/xpConfig.ts` - XP constants
- [ ] `/packages/core/src/data/spillover.ts` - Spillover mapping

### Phase 1
- [ ] `/packages/core/src/domain/xp.ts` - XP calculation
- [ ] `/packages/core/src/domain/levels.ts` - Level progression
- [ ] `/packages/core/src/domain/workout.ts` - Workout completion
- [ ] `/packages/core/src/domain/state.ts` - GameState types
- [ ] `/packages/core/src/persistence/` - Storage adapters

### Phase 2
- [ ] `/apps/mobile/` - Expo app scaffold
- [ ] Minimal screens (Home, Workout, Log, Settings)
- [ ] Zustand store integration

### Phase 3
- [ ] `/supabase/migrations/001_initial_schema.sql`
- [ ] RLS policies
- [ ] Database functions

### Phase 4
- [ ] Sync service implementation
- [ ] Login/signup flow
- [ ] Offline-first persistence

### Phase 5
- [ ] Core domain tests
- [ ] Integration tests

### Documentation
- [ ] `/docs/architecture.md`
- [ ] `/docs/data-model.md`
- [ ] `/docs/sync-strategy.md`
- [ ] Updated README

---

## Timeline Estimate

This plan focuses on correctness and architecture. Estimated effort:
- Phase 0: Foundation setup
- Phase 1: Core domain logic
- Phase 2: Minimal UI
- Phase 3: Database schema
- Phase 4: Sync implementation
- Phase 5: Testing & polish

---

*Document created: January 30, 2026*
*Author: Claude Code*
