/**
 * XPGains Persistence Module Exports
 */

export {
  InMemoryStorageAdapter,
  StateStorage,
} from './storage';

export {
  migrateState,
  needsMigration,
} from './migrations';
