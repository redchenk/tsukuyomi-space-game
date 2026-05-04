import Phaser from 'phaser';

interface Particle {
  shape: Phaser.GameObjects.Arc;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export default class ParticleSystem {
  private particles: Particle[] = [];

  constructor(private scene: Phaser.Scene) {}

  burst(x: number, y: number, color = 0x7dd3fc, count = 12) {
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 210;
      const life = 260 + Math.random() * 520;
      const shape = this.scene.add.circle(x, y, 2 + Math.random() * 4, color, 0.9).setDepth(20);
      this.particles.push({ shape, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, maxLife: life });
    }
  }

  trail(x: number, y: number, color = 0xc084fc) {
    const shape = this.scene.add.circle(x, y, 5 + Math.random() * 8, color, 0.22).setDepth(8);
    this.particles.push({
      shape,
      vx: (Math.random() - 0.5) * 36,
      vy: (Math.random() - 0.5) * 36,
      life: 420,
      maxLife: 420
    });
  }

  update(delta: number) {
    const dt = delta / 1000;
    this.particles = this.particles.filter((particle) => {
      particle.life -= delta;
      particle.shape.x += particle.vx * dt;
      particle.shape.y += particle.vy * dt;
      particle.shape.setAlpha(Math.max(0, particle.life / particle.maxLife));
      if (particle.life > 0) return true;
      particle.shape.destroy();
      return false;
    });
  }

  destroy() {
    this.particles.forEach((particle) => particle.shape.destroy());
    this.particles = [];
  }
}
