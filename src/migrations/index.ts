import * as migration_20261024_123058_initial from './20261024_123058_initial';

export const migrations = [
  {
    up: migration_20261024_123058_initial.up,
    down: migration_20261024_123058_initial.down,
    name: '20261024_123058_initial'
  },
];
