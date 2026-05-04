import Phaser from 'phaser';

interface Fish {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: number;
  alpha: number;
  phase: number;
  direction: number;
}

export default class FishBackgroundSystem {
  private graphics: Phaser.GameObjects.Graphics;
  private fish: Fish[] = [];

  constructor(private scene: Phaser.Scene, quality: 'low' | 'medium' | 'high') {
    this.graphics = scene.add.graphics().setScrollFactor(0.18).setDepth(-30);
    const count = quality === 'low' ? 20 : quality === 'medium' ? 36 : 56;
    const colors = [0x7dd3fc, 0xa78bfa, 0xf0abfc, 0x86efac];
    for (let index = 0; index < count; index += 1) {
      this.fish.push({
        x: Math.random() * 2600,
        y: Math.random() * 1600,
        size: 6 + Math.random() * 16,
        speed: 10 + Math.random() * 34,
        color: colors[index % colors.length],
        alpha: 0.08 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
        direction: Math.random() > 0.5 ? 1 : -1
      });
    }
  }

  update(delta: number) {
    const dt = delta / 1000;
    this.graphics.clear();
    this.fish.forEach((fish) => {
      fish.phase += dt * 2;
      fish.x += fish.speed * fish.direction * dt;
      fish.y += Math.sin(fish.phase) * 15 * dt;
      if (fish.direction > 0 && fish.x > 2600) fish.x = -80;
      if (fish.direction < 0 && fish.x < -80) fish.x = 2600;
      this.graphics.fillStyle(fish.color, fish.alpha);
      this.graphics.fillEllipse(fish.x, fish.y, fish.size * 2, fish.size);
      this.graphics.fillTriangle(
        fish.x - fish.direction * fish.size * 1.2,
        fish.y,
        fish.x - fish.direction * fish.size * 2.2,
        fish.y - fish.size * 0.55,
        fish.x - fish.direction * fish.size * 2.2,
        fish.y + fish.size * 0.55
      );
    });
  }

  destroy() {
    this.graphics.destroy();
  }
}
