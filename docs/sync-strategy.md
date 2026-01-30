# XPGains Sync Strategy

## Overview

XPGains uses an offline-first sync strategy that ensures:
1. Local state is always immediately updated
2. App works fully offline
3. Sync is eventual and idempotent
4. No data loss on conflicts

## Core Principles

### 1. Local-First Updates

```
User Action
    │
    ├──► Update Local State (immediate)
    │
    ├──► Save to AsyncStorage (debounced)
    │
    └──► Queue for Sync (background)
```

The user never waits for network operations.

### 2. Idempotent Operations

All sync operations can be safely repeated:

```sql
-- XP events use client-generated IDs
INSERT INTO xp_events (user_id, client_event_id, ...)
ON CONFLICT (user_id, client_event_id) DO NOTHING;
```

### 3. Event Sourcing

XP is tracked via immutable events, not direct mutations:

```
Wrong: UPDATE user_stats SET chest_xp = chest_xp + 50
Right: INSERT INTO xp_events (skill_id, amount) VALUES ('chest', 50)
```

The `user_stats` table is recalculated from events.

## Sync Flows

### Login Flow

```
User Signs In
    │
    ├──► Fetch user_stats from server
    │         │
    │         ├──► Server has data?
    │         │         │
    │         │         ├──► Yes: Pull server state → Rebuild local
    │         │         │
    │         │         └──► No: Local has data?
    │         │                   │
    │         │                   ├──► Yes: Push local → Server
    │         │                   │
    │         │                   └──► No: Start fresh
    │         │
    │         └──► Merge settings and preferences
    │
    └──► Start background sync loop
```

### Push Flow

When local changes need to sync:

```typescript
async function pushChanges() {
  const pendingEvents = getUnsynced(state.history.xpEvents);
  const pendingSessions = getUnsynced(state.history.workoutSessions);

  // Push workout sessions first (xp_events reference them)
  for (const session of pendingSessions) {
    await supabase.from('workout_sessions').upsert({
      id: session.id,  // Client-generated
      user_id: userId,
      ...sessionData
    });
  }

  // Push XP events (deduplicated by client_event_id)
  for (const event of pendingEvents) {
    await supabase.from('xp_events').upsert({
      user_id: userId,
      client_event_id: event.clientEventId,  // Client-generated
      ...eventData
    }, {
      onConflict: 'user_id,client_event_id',
      ignoreDuplicates: true
    });
  }

  // Recalculate server-side stats
  await supabase.rpc('recalculate_user_stats', { p_user_id: userId });
}
```

### Pull Flow

When fetching server state:

```typescript
async function pullServerState(userId: string): Promise<GameState> {
  const [stats, sessions, events, settings] = await Promise.all([
    supabase.from('user_stats').select().eq('user_id', userId).single(),
    supabase.from('workout_sessions').select().eq('user_id', userId),
    supabase.from('xp_events').select().eq('user_id', userId),
    supabase.from('user_settings').select().eq('user_id', userId).single(),
  ]);

  return buildGameStateFromServerData({
    stats: stats.data,
    sessions: sessions.data,
    events: events.data,
    settings: settings.data,
  });
}
```

## Conflict Resolution

### XP Conflicts

Conflicts are prevented by design:
- Client generates unique event IDs
- Server rejects duplicates via UNIQUE constraint
- Stats are always recalculated from events

### Settings Conflicts

Last-write-wins with timestamp:
```typescript
if (serverSettings.updated_at > localSettings.updated_at) {
  useServerSettings();
} else {
  pushLocalSettings();
}
```

### Workout Session Conflicts

Sessions are identified by client-generated UUIDs:
- If server has session ID, it's already synced
- If not, push the session
- Duplicate pushes are ignored

## Error Handling

### Network Failures

```typescript
async function syncWithRetry() {
  const maxRetries = 4;
  const baseDelay = 2000; // 2s

  for (let i = 0; i < maxRetries; i++) {
    try {
      await pushChanges();
      return;
    } catch (error) {
      if (i < maxRetries - 1) {
        await delay(baseDelay * Math.pow(2, i)); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}
```

### Partial Sync Failures

Each item syncs independently:
- Failed items remain in pending queue
- Successful items are marked as synced
- Retry on next sync attempt

## Guest Mode

Guest users work entirely offline:
- State saved to AsyncStorage only
- No network requests
- Can "upgrade" to account later

### Account Upgrade Flow

```
Guest User Signs Up
    │
    ├──► Create auth account
    │
    ├──► Push all local data to server
    │         │
    │         ├──► Workout sessions
    │         ├──► XP events
    │         ├──► Settings
    │         └──► Custom exercises
    │
    └──► Enable background sync
```

## Sync State Tracking

The `meta` field tracks sync status:

```typescript
meta: {
  lastModifiedAt: string;   // When state last changed locally
  lastSyncAt?: string;      // When last successful sync completed
  pendingSync: boolean;     // Has unsynced changes
}
```

## Security Considerations

1. **Authentication Required**: All sync operations require valid session
2. **RLS Enforced**: Server rejects unauthorized data access
3. **Client Validation**: Validate data before pushing to server
4. **Secure Storage**: Auth tokens in SecureStore (not AsyncStorage)

## Performance Optimizations

1. **Batch Operations**: Push multiple events in single request
2. **Debounced Saves**: Don't save on every keystroke
3. **Background Sync**: Don't block UI on network
4. **Selective Pull**: Only fetch data that might have changed
