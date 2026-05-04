import Phaser from 'phaser';
import Unit from '../entities/Unit';
import Structure from '../entities/Structure';
import Projectile from '../entities/Projectile';
import ParticleSystem from './ParticleSystem';
import { distance } from '../utils/math';

export type CombatTarget = Unit | Structure;

export default class CombatSystem {
  constructor(private scene: Phaser.Scene, private particles: ParticleSystem) {}

  projectileAttack(attacker: Unit | Structure, target: CombatTarget, projectiles: Projectile[], damage = attacker.attackDamage, speed = 520, pierce = false) {
    if (!attacker.alive || !target.alive) return;
    const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, target.x, target.y);
    const color = attacker.team === 'blue' ? 0x7dd3fc : 0xfb7185;
    projectiles.push(new Projectile(this.scene, {
      team: attacker.team,
      x: attacker.x,
      y: attacker.y,
      angle,
      speed,
      damage,
      color,
      targetId: target.id,
      pierce
    }));
    if ('markAttack' in attacker) attacker.markAttack();
  }

  meleeAttack(attacker: Unit, target: CombatTarget) {
    if (!attacker.canAttack() || distance(attacker, target) > attacker.attackRange + 14) return 0;
    attacker.markAttack();
    const dealt = target.takeDamage(attacker.attackDamage);
    this.particles.burst(target.x, target.y, attacker.team === 'blue' ? 0x7dd3fc : 0xfb7185, 7);
    return dealt;
  }

  updateProjectiles(projectiles: Projectile[], targets: CombatTarget[], delta: number, onHit: (projectile: Projectile, target: CombatTarget, damage: number) => void) {
    projectiles.forEach((projectile) => projectile.update(delta));
    projectiles.forEach((projectile) => {
      if (!projectile.alive) return;
      const candidates = targets.filter((target) => target.team !== projectile.team && target.alive);
      const target = candidates.find((item) => distance({ x: projectile.sprite.x, y: projectile.sprite.y }, item) < 22);
      if (!target) return;
      const dealt = target.takeDamage(projectile.damage);
      this.particles.burst(target.x, target.y, projectile.team === 'blue' ? 0x7dd3fc : 0xfb7185, 8);
      onHit(projectile, target, dealt);
      if (!projectile.pierce) projectile.destroy();
    });
  }
}
