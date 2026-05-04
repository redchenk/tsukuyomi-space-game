import Phaser from 'phaser';
import type { TeamId } from '../../store/matchStore';

export default class CapturePoint {
  id: string;
  name: string;
  x: number;
  y: number;
  owner: TeamId | null = null;
  progress = 0;
  contested = false;
  cooldown = 0;
  sprite: Phaser.GameObjects.Container;
  ring: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, id: string, name: string, x: number, y: number) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.ring = scene.add.circle(0, 0, 86, 0x7dd3fc, 0.08).setStrokeStyle(3, 0x7dd3fc, 0.42);
    const core = scene.add.circle(0, 0, 22, 0xf0abfc, 0.35);
    this.sprite = scene.add.container(x, y, [this.ring, core]);
  }

  update(delta: number) {
    this.cooldown = Math.max(0, this.cooldown - delta / 1000);
    this.sprite.rotation += delta * 0.0005;
    const color = this.owner === 'blue' ? 0x7dd3fc : this.owner === 'red' ? 0xfb7185 : 0xf0abfc;
    this.ring.setStrokeStyle(3, color, this.contested ? 0.9 : 0.42);
  }
}
