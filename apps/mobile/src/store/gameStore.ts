/**
 * XPGains Game Store
 * Zustand store for state management with persistence
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GameState,
  createInitialState,
  applyXpEvent,
  updateSettings,
  toggleFavorite,
  completeSet,
  undoLogEntry,
  setChallenge,
  addCustomExercise,
  removeCustomExercise,
  addTrainingPlan,
  updateTrainingPlan,
  removeTrainingPlan,
  updateEquipment,
  updateBody,
  updateProfile,
  markSynced,
  resetProgress,
  calibrateSkills,
  generateChallenge,
  levelFromXp,
  getTotalLevel,
  SetInput,
  RecentSet,
  LogEntry,
  XpEvent,
  UserSettings,
  CustomExercise,
  TrainingPlan,
  ChallengeType,
  ChallengeFocus,
  SkillId,
  EquipmentId,
  StateStorage,
} from '@xpgains/core';

/**
 * AsyncStorage adapter for @xpgains/core
 */
const asyncStorageAdapter = {
  getItem: async (key: string) => AsyncStorage.getItem(key),
  setItem: async (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: async (key: string) => AsyncStorage.removeItem(key),
  getAllKeys: async () => AsyncStorage.getAllKeys() as Promise<string[]>,
};

/**
 * Storage instance
 */
const storage = new StateStorage(asyncStorageAdapter);

/**
 * Store interface
 */
interface GameStore {
  // State
  state: GameState;
  isLoading: boolean;
  isInitialized: boolean;
  recentSets: RecentSet[];
  logEntries: LogEntry[];

  // Initialization
  initialize: () => Promise<void>;

  // XP Actions
  completeSet: (exerciseId: string, set: SetInput) => void;
  undoLogEntry: (logEntry: LogEntry) => void;

  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Favorites
  toggleFavorite: (exerciseId: string) => void;

  // Challenges
  startChallenge: (type: ChallengeType, focus?: ChallengeFocus) => void;
  clearChallenge: () => void;

  // Custom Exercises
  addCustomExercise: (exercise: CustomExercise) => void;
  removeCustomExercise: (exerciseId: string) => void;

  // Training Plans
  addTrainingPlan: (plan: TrainingPlan) => void;
  updateTrainingPlan: (plan: TrainingPlan) => void;
  removeTrainingPlan: (planId: string) => void;

  // Equipment
  updateEquipment: (enabled: boolean, available: EquipmentId[]) => void;

  // Profile
  updateProfile: (displayName: string) => void;
  updateBody: (body: Partial<NonNullable<GameState['body']>>) => void;

  // Calibration
  calibrateSkills: (skillLevels: Partial<Record<SkillId, number>>) => void;

  // Reset
  resetProgress: () => void;

  // Sync
  markSynced: () => void;

  // Helpers
  getSkillLevel: (skillId: SkillId) => number;
  getTotalLevel: () => number;
}

/**
 * Create the game store
 */
export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  state: createInitialState(),
  isLoading: true,
  isInitialized: false,
  recentSets: [],
  logEntries: [],

  /**
   * Initialize store by loading from persistence
   */
  initialize: async () => {
    try {
      const loadedState = await storage.loadState();
      set({
        state: loadedState,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({
        state: createInitialState(),
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  /**
   * Complete a set and award XP
   */
  completeSet: (exerciseId: string, setInput: SetInput) => {
    const { state, recentSets, logEntries } = get();

    try {
      const result = completeSet(state, exerciseId, setInput, recentSets);

      // Update recent sets (max 50)
      const newRecentSets = [
        ...recentSets,
        {
          exerciseId,
          weight: setInput.weightKg,
          reps: setInput.reps,
          timestamp: Date.now(),
        },
      ].slice(-50);

      set({
        state: result.newState,
        recentSets: newRecentSets,
        logEntries: [...logEntries, result.logEntry],
      });

      // Persist
      storage.saveState(result.newState);
    } catch (error) {
      console.error('Failed to complete set:', error);
    }
  },

  /**
   * Undo a log entry
   */
  undoLogEntry: (logEntry: LogEntry) => {
    const { state, logEntries } = get();

    const newState = undoLogEntry(state, logEntry);
    const newLogEntries = logEntries.filter(e => e.id !== logEntry.id);

    set({
      state: newState,
      logEntries: newLogEntries,
    });

    storage.saveState(newState);
  },

  /**
   * Update settings
   */
  updateSettings: (settings: Partial<UserSettings>) => {
    const { state } = get();
    const newState = updateSettings(state, settings);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Toggle favorite exercise
   */
  toggleFavorite: (exerciseId: string) => {
    const { state } = get();
    const newState = toggleFavorite(state, exerciseId);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Start a new challenge
   */
  startChallenge: (type: ChallengeType, focus: ChallengeFocus = 'full') => {
    const { state } = get();
    const challenge = generateChallenge(type, focus);
    const newState = setChallenge(state, challenge);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Clear the current challenge
   */
  clearChallenge: () => {
    const { state } = get();
    const newState = setChallenge(state, null);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Add a custom exercise
   */
  addCustomExercise: (exercise: CustomExercise) => {
    const { state } = get();
    const newState = addCustomExercise(state, exercise);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Remove a custom exercise
   */
  removeCustomExercise: (exerciseId: string) => {
    const { state } = get();
    const newState = removeCustomExercise(state, exerciseId);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Add a training plan
   */
  addTrainingPlan: (plan: TrainingPlan) => {
    const { state } = get();
    const newState = addTrainingPlan(state, plan);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Update a training plan
   */
  updateTrainingPlan: (plan: TrainingPlan) => {
    const { state } = get();
    const newState = updateTrainingPlan(state, plan);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Remove a training plan
   */
  removeTrainingPlan: (planId: string) => {
    const { state } = get();
    const newState = removeTrainingPlan(state, planId);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Update equipment settings
   */
  updateEquipment: (enabled: boolean, available: EquipmentId[]) => {
    const { state } = get();
    const newState = updateEquipment(state, enabled, available);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Update profile
   */
  updateProfile: (displayName: string) => {
    const { state } = get();
    const newState = updateProfile(state, displayName);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Update body metrics
   */
  updateBody: (body: Partial<NonNullable<GameState['body']>>) => {
    const { state } = get();
    const newState = updateBody(state, body);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Calibrate skill levels
   */
  calibrateSkills: (skillLevels: Partial<Record<SkillId, number>>) => {
    const { state } = get();
    const newState = calibrateSkills(state, skillLevels);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Reset all progress
   */
  resetProgress: () => {
    const { state } = get();
    const newState = resetProgress(state);

    set({
      state: newState,
      recentSets: [],
      logEntries: [],
    });

    storage.saveState(newState);
  },

  /**
   * Mark state as synced
   */
  markSynced: () => {
    const { state } = get();
    const newState = markSynced(state);

    set({ state: newState });
    storage.saveState(newState);
  },

  /**
   * Get skill level
   */
  getSkillLevel: (skillId: SkillId) => {
    const { state } = get();
    return levelFromXp(state.stats.skillXp[skillId] || 0);
  },

  /**
   * Get total level
   */
  getTotalLevel: () => {
    const { state } = get();
    return getTotalLevel(state.stats.skillXp);
  },
}));
