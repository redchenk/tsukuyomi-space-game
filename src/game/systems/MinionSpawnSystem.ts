import Phaser from 'phaser';
import type { TeamId } from '../../store/matchStore';
import { matchConfig } from '../config/match';
import { mapConfig } from '../config/map';
import Minion, { type MinionType } from '../entities/Minion';

export default class MinionSpawnSystem {
  private timer = 1.2;
  wave = 0;

  constructor(private scene: Phaser.Scene) {}

  update(delta: number, onSpawn: (minion: Minion) => void) {
    this.timer -= delta / 1000;
    if (this.timer > 0) return;
    this.wave += 1;
    this.timer = matchConfig.minionWaveInterval;
    this.spawnWave('blue', onSpawn);
    this.spawnWave('red', onSpawn);
  }

  private spawnWave(team: TeamId, onSpawn: (minion: Minion) => void) {
    const base = team === 'blue' ? mapConfig.blueBase : mapConfig.redBase;
    const direction = team === 'blue' ? 1 : -1;
    const types: MinionType[] = ['melee', 'melee', 'melee', 'ranged', 'ranged'];
    if (this.wave % 3 === 0) types.push('core');
    types.forEach((type, index) => {
      const minion = new Minion(this.scene, team, type, base.x + direction * (54 + index * 16), base.y - 48 + index * 24);
      minion.pathIndex = 0;
      onSpawn(minion);
    });
  }
}
