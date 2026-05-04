import Phaser from 'phaser';
import type { TeamId } from '../../store/matchStore';

let structureSerial = 0;

export default class Structure {
  id: string;
  team: TeamId;
  type: 'tower' | 'core';
  sprite: Phaser.GameObjects.Container;
  hp: number;
  maxHp: number;
  attackRange = 0;
  attackDamage = 0;
  attackInterval = 1;
  attackTimer = 0;
  color: number;

  constructor(scene: Phaser.Scene, options: {
    team: TeamId;
    type: 'tower' | 'core';
    x: number;
    y: number;
    hp: number;
    range?: number;
    damage?: number;
    interval?: number;
  }) {
    this.id = `${options.type}-${options.team}-${structureSerial += 1}`;
    this.team = options.team;
    this.type = options.type;
    this.hp = options.hp;
    this.maxHp = options.hp;
    this.attackRange = options.range || 0;
    this.attackDamage = options.damage || 0;
    this.attackInterval = options.interval || 1;
    this.color = options.team === 'blue' ? 0x38bdf8 : 0xf43f5e;
    const radius = options.type === 'core' ? 54 : 36;
    const glow = scene.add.circle(0, 0, radius + 24, this.color, 0.14);
    const base = scene.add.circle(0, 0, radius, options.team === 'blue' ? 0x102a4a : 0x4a1024, 0.9).setStrokeStyle(3, this.color, 0.85);
    const prism = scene.add.polygon(0, 0, [0, -radius * 0.9, radius * 0.55, 0, 0, radius * 0.9, -radius * 0.55, 0], this.color, 0.65);
    this.sprite = scene.add.container(options.x, options.y, [glow, base, prism]);
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get alive() { return this.hp > 0; }

  update(delta: number) {
    this.attackTimer = Math.max(0, this.attackTimer - delta / 1000);
    this.sprite.rotation += (this.type === 'core' ? 0.00045 : 0.00025) * delta;
    this.sprite.setAlpha(this.alive ? 1 : 0.25);
  }

  canAttack() {
    return this.alive && this.attackRange > 0 && this.attackTimer <= 0;
  }

  markAttack() {
    this.attackTimer = this.attackInterval;
  }

  takeDamage(amount: number) {
    if (!this.alive) return 0;
    this.hp = Math.max(0, this.hp - amount);
    return amount;
  }
}
