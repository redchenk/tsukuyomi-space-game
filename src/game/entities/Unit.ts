import Phaser from 'phaser';
import type { TeamId } from '../../store/matchStore';
import { clamp } from '../utils/math';

let unitSerial = 0;

export default class Unit {
  id: string;
  team: TeamId;
  kind: 'hero' | 'minion';
  name: string;
  role = '';
  sprite: Phaser.GameObjects.Container;
  body: Phaser.Physics.Arcade.Body;
  hp: number;
  maxHp: number;
  attackDamage: number;
  attackRange: number;
  attackInterval: number;
  moveSpeed: number;
  attackTimer = 0;
  level = 1;
  exp = 0;
  kills = 0;
  deaths = 0;
  assists = 0;
  respawnTimer = 0;
  shield = 0;
  targetPoint: Phaser.Math.Vector2 | null = null;
  isPlayer = false;
  aiState = 'laning';
  pathIndex = 0;
  color: number;

  constructor(scene: Phaser.Scene, options: {
    team: TeamId;
    kind: 'hero' | 'minion';
    name: string;
    x: number;
    y: number;
    hp: number;
    attackDamage: number;
    attackRange: number;
    attackInterval: number;
    moveSpeed: number;
    color: number;
    radius?: number;
  }) {
    this.id = `${options.kind}-${options.team}-${unitSerial += 1}`;
    this.team = options.team;
    this.kind = options.kind;
    this.name = options.name;
    this.hp = options.hp;
    this.maxHp = options.hp;
    this.attackDamage = options.attackDamage;
    this.attackRange = options.attackRange;
    this.attackInterval = options.attackInterval;
    this.moveSpeed = options.moveSpeed;
    this.color = options.color;
    const radius = options.radius || (options.kind === 'hero' ? 24 : 14);
    const glow = scene.add.circle(0, 0, radius + 10, options.color, 0.16);
    const shell = scene.add.circle(0, 0, radius, options.team === 'blue' ? 0x0f2742 : 0x421425, 0.96).setStrokeStyle(2, options.color, 0.85);
    const core = scene.add.circle(radius * 0.28, -radius * 0.16, Math.max(4, radius * 0.22), 0xf8fafc, 0.9);
    this.sprite = scene.add.container(options.x, options.y, [glow, shell, core]);
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCircle(radius, -radius, -radius);
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get alive() { return this.hp > 0; }

  updateTimers(delta: number) {
    const dt = delta / 1000;
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.respawnTimer = Math.max(0, this.respawnTimer - dt);
    this.shield = Math.max(0, this.shield - delta * 0.03);
    this.sprite.setAlpha(this.alive ? 1 : 0.18);
    this.sprite.setVisible(this.alive);
  }

  moveToward(target: { x: number; y: number }) {
    if (!this.alive) {
      this.body.setVelocity(0, 0);
      return;
    }
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    if (dist < 8) {
      this.body.setVelocity(0, 0);
      return;
    }
    this.body.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
  }

  stop() {
    this.body.setVelocity(0, 0);
  }

  canAttack() {
    return this.alive && this.attackTimer <= 0;
  }

  markAttack() {
    this.attackTimer = this.attackInterval;
  }

  takeDamage(amount: number) {
    if (!this.alive) return 0;
    const absorbed = Math.min(this.shield, amount);
    this.shield -= absorbed;
    const final = Math.max(1, amount - absorbed);
    this.hp = clamp(this.hp - final, 0, this.maxHp);
    return final;
  }

  heal(amount: number) {
    this.hp = clamp(this.hp + amount, 0, this.maxHp);
  }

  respawn(x: number, y: number) {
    this.hp = this.maxHp;
    this.sprite.setPosition(x, y);
    this.targetPoint = null;
    this.pathIndex = 0;
    this.body.setVelocity(0, 0);
  }

  gainExp(value: number) {
    this.exp += value;
    while (this.exp >= this.level * 100) {
      this.exp -= this.level * 100;
      this.level += 1;
      this.maxHp += 42;
      this.hp += 42;
      this.attackDamage += 4;
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}
