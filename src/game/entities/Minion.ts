import Phaser from 'phaser';
import Unit from './Unit';
import type { TeamId } from '../../store/matchStore';
import { minionBalance } from '../config/balance';

export type MinionType = 'melee' | 'ranged' | 'core';

export default class Minion extends Unit {
  minionType: MinionType;

  constructor(scene: Phaser.Scene, team: TeamId, type: MinionType, x: number, y: number) {
    const config = minionBalance[type];
    const color = team === 'blue' ? (type === 'core' ? 0x38bdf8 : 0x60a5fa) : (type === 'core' ? 0xf43f5e : 0xf87171);
    super(scene, {
      team,
      kind: 'minion',
      name: type === 'core' ? '能量核心兵' : type === 'ranged' ? '远程小兵' : '近战小兵',
      x,
      y,
      hp: config.hp,
      attackDamage: config.damage,
      attackRange: config.range,
      attackInterval: type === 'core' ? 1.1 : 1.25,
      moveSpeed: config.speed,
      color,
      radius: type === 'core' ? 18 : 13
    });
    this.minionType = type;
  }
}
