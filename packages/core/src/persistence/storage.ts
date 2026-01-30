/**
 * XPGains Storage Layer
 * Abstract storage adapter for persistence
 */

import type { GameState, StorageAdapter } from '../types';
import { createInitialState, CURRENT_SCHEMA_VERSION } from '../domain';
import { migrateState } from './migrations';

/**
 * Storage key for the game state
 */
const STATE_KEY = 'xpgains_state';

/**
 * Default in-memory storage adapter (for testing)
 */
export class InMemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Storage manager for game state persistence
 */
export class StateStorage {
  private adapter: StorageAdapter;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingState: GameState | null = null;

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  /**
   * Load the game state from storage
   * Returns initial state if no saved state exists
   */
  async loadState(): Promise<GameState> {
    try {
      const json = await this.adapter.getItem(STATE_KEY);

      if (!json) {
        return createInitialState();
      }

      const parsed = JSON.parse(json);

      // Migrate if necessary
      if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
        const migrated = migrateState(parsed);
        // Save migrated state
        await this.saveState(migrated, true);
        return migrated;
      }

      return parsed as GameState;
    } catch (error) {
      console.error('Failed to load state:', error);
      return createInitialState();
    }
  }

  /**
   * Save the game state to storage
   * @param state - State to save
   * @param immediate - If true, save immediately without debouncing
   */
  async saveState(state: GameState, immediate: boolean = false): Promise<void> {
    if (immediate) {
      await this.doSave(state);
      return;
    }

    // Debounce saves to avoid excessive writes
    this.pendingState = state;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      if (this.pendingState) {
        await this.doSave(this.pendingState);
        this.pendingState = null;
      }
    }, 500);
  }

  /**
   * Actually perform the save operation
   */
  private async doSave(state: GameState): Promise<void> {
    try {
      const json = JSON.stringify(state);
      await this.adapter.setItem(STATE_KEY, json);
    } catch (error) {
      console.error('Failed to save state:', error);
      throw error;
    }
  }

  /**
   * Force save any pending state immediately
   */
  async flush(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.pendingState) {
      await this.doSave(this.pendingState);
      this.pendingState = null;
    }
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    await this.adapter.removeItem(STATE_KEY);
  }

  /**
   * Export state as JSON string (for backup)
   */
  async exportState(): Promise<string> {
    const state = await this.loadState();
    return JSON.stringify(state, null, 2);
  }

  /**
   * Import state from JSON string (for restore)
   * @throws Error if JSON is invalid or state format is invalid
   */
  async importState(json: string): Promise<GameState> {
    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(json);
    } catch (error) {
      throw new Error(
        `Invalid JSON format: ${error instanceof Error ? error.message : 'parse error'}`
      );
    }

    // Validate basic structure
    if (!parsed.schemaVersion || !parsed.profile || !parsed.stats) {
      throw new Error('Invalid state format: missing required fields (schemaVersion, profile, or stats)');
    }

    // Migrate if necessary
    const migrated =
      parsed.schemaVersion !== CURRENT_SCHEMA_VERSION
        ? migrateState(parsed)
        : (parsed as unknown as GameState);

    await this.saveState(migrated, true);
    return migrated;
  }
}
