import Phaser from 'phaser';
import type { TeamId } from '../../store/matchStore';

export default class Projectile {
  id: string;
  team: TeamId;
  sprite: Phaser.GameObjects.Arc;
  body: Phaser.Physics.Arcade.Body;
  damage: number;
  targetId?: string;
  life = 1600;
  pierce = false;

  constructor(scene: Phaser.Scene, options: {
    team: TeamId;
    x: number;
    y: number;
    angle: number;
    speed: number;
    damage: number;
    color: number;
    targetId?: string;
    pierce?: boolean;
  }) {
    this.id = `projectile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.team = options.team;
    this.damage = options.damage;
    this.targetId = options.targetId;
    this.pierce = Boolean(options.pierce);
    this.sprite = scene.add.circle(options.x, options.y, 6, options.color, 0.94).setStrokeStyle(2, 0xf8fafc, 0.6);
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCircle(6);
    scene.physics.velocityFromRotation(options.angle, options.speed, this.body.velocity);
  }

  update(delta: number) {
    this.life -= delta;
    this.sprite.alpha = Math.max(0, this.life / 1600);
  }

  get alive() {
    return this.life > 0 && this.sprite.active;
  }

  destroy() {
    this.sprite.destroy();
  }
}
