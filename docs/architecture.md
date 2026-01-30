# XPGains Architecture

## Overview

XPGains is a gamified fitness tracker that transforms strength training into an RPG-like experience. This document describes the architecture of the rebuilt mobile-first application.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile App (Expo)                        │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   React Native  │  │   Zustand    │  │   AsyncStorage   │  │
│  │   Components    │  │    Store     │  │   (Offline)      │  │
│  └────────┬────────┘  └──────┬───────┘  └────────┬─────────┘  │
│           │                  │                    │            │
│           └──────────────────┼────────────────────┘            │
│                              │                                  │
│                    ┌─────────┴─────────┐                       │
│                    │   @xpgains/core   │                       │
│                    │  (Domain Logic)   │                       │
│                    └─────────┬─────────┘                       │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │    Sync Service     │
                    │   (When Online)     │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                         Supabase                                │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │      Auth       │  │   Database   │  │   RLS Policies   │  │
│  │  (email/pass)   │  │  (Postgres)  │  │   (Security)     │  │
│  └─────────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
/
├── apps/
│   └── mobile/              # Expo React Native app
│       ├── app/             # Expo Router screens
│       ├── src/
│       │   ├── store/       # Zustand state management
│       │   └── services/    # Supabase client, sync
│       └── assets/          # Images, fonts
│
├── packages/
│   └── core/                # Domain logic (UI-agnostic)
│       ├── src/
│       │   ├── data/        # Static data (skills, exercises)
│       │   ├── domain/      # Business logic (XP, levels)
│       │   ├── persistence/ # Storage adapters, migrations
│       │   └── types/       # TypeScript type definitions
│       └── __tests__/       # Unit tests
│
├── supabase/
│   └── migrations/          # SQL schema migrations
│
└── docs/                    # Documentation
```

## Key Design Decisions

### 1. Domain-Driven Design

All game rules live in `@xpgains/core`:
- XP calculation formulas
- Level progression curves
- State mutations
- No UI dependencies

This allows:
- Pure function testing
- Reuse across platforms
- Clear separation of concerns

### 2. Offline-First Architecture

```
User Action → Local State → AsyncStorage → [Background Sync] → Supabase
```

- Local state is always immediately updated
- Changes persist to AsyncStorage immediately
- Sync happens in background when online
- No blocking on network requests

### 3. Idempotent Operations

All XP-awarding operations are idempotent:
- Client generates UUIDs for sessions and events
- Server uses `UNIQUE(user_id, client_event_id)` constraint
- Duplicate syncs are safely ignored

### 4. Event Sourcing for XP

XP is tracked via immutable events:
- `xp_events` table is append-only
- `user_stats` is a materialized view
- Can replay events to reconstruct state
- Audit trail for all XP changes

## Data Flow

### Workout Completion Flow

```
1. User completes set
   │
2. completeSet(state, exerciseId, {reps, weight})
   │
3. Calculate XP (domain/xp.ts)
   │  - Base XP (compound: 50, isolation: 35)
   │  - × Reps factor (0.6 - 2.0)
   │  - × Intensity factor (0.7 - 1.6)
   │  - × Diminishing returns
   │  - × Neglected bonus (+10%)
   │
4. Generate XP events
   │  - Primary skill event
   │  - Spillover events (for compounds)
   │
5. Apply to state
   │
6. Save to AsyncStorage
   │
7. [If online] Sync to Supabase
```

### Sync Flow

```
Login
  │
  ├─► Server has data?
  │     │
  │     ├─► Yes: Pull server → Rebuild local
  │     │
  │     └─► No: Push local → Server
  │
  └─► Background sync loop
        │
        ├─► Push pending xp_events
        │
        └─► Recalculate user_stats
```

## Security Model

### Row Level Security (RLS)

All Supabase tables enforce:
```sql
POLICY "Users can manage own data"
  FOR ALL USING (auth.uid() = user_id);
```

### Authentication

- Email/password via Supabase Auth
- Session tokens stored in SecureStore (iOS Keychain / Android Keystore)
- Guest mode supported (local-only)

## Performance Considerations

### State Management

- Zustand for minimal re-renders
- Debounced persistence (500ms)
- Immutable updates

### Database

- Indexed queries on user_id
- Materialized stats view
- JSONB for flexible schemas

## Future Considerations

1. **Social Features**: Friends leaderboards, sharing
2. **Programs**: Structured workout plans
3. **AI Integration**: Workout recommendations
4. **Cross-Platform**: Web app using same core
