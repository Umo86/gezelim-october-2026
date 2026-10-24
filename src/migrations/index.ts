import * as migration_20261024_123058_initial from './20261024_123058_initial';
import * as migration_20261024_160045_review_fixes from './20261024_160045_review_fixes';

export const migrations = [
  {
    up: migration_20261024_123058_initial.up,
    down: migration_20261024_123058_initial.down,
    name: '20261024_123058_initial',
  },
  {
    up: migration_20261024_160045_review_fixes.up,
    down: migration_20261024_160045_review_fixes.down,
    name: '20261024_160045_review_fixes'
  },
];
