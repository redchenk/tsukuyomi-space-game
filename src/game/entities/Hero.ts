import Phaser from 'phaser';
import Unit from './Unit';
import type { TeamId } from '../../store/matchStore';
import { heroConfig } from '../config/heroes';

export default class Hero extends Unit {
  heroId: string;
  skillIds: string[];
  cooldowns: Record<string, number> = {};

  constructor(scene: Phaser.Scene, team: TeamId, heroId: string, x: number, y: number, isPlayer = false) {
    const config = heroConfig(heroId);
    super(scene, {
      team,
      kind: 'hero',
      name: config.name,
      x,
      y,
      hp: config.maxHp,
      attackDamage: config.attackDamage,
      attackRange: config.attackRange,
      attackInterval: config.attackInterval,
      moveSpeed: config.moveSpeed,
      color: team === 'blue' ? config.color : 0xfb7185,
      radius: 23
    });
    this.heroId = heroId;
    this.role = config.role;
    this.skillIds = config.skills;
    this.isPlayer = isPlayer;
    this.skillIds.forEach((id) => { this.cooldowns[id] = 0; });
  }

  override updateTimers(delta: number) {
    super.updateTimers(delta);
    const dt = delta / 1000;
    this.skillIds.forEach((id) => {
      this.cooldowns[id] = Math.max(0, (this.cooldowns[id] || 0) - dt);
    });
  }
}
