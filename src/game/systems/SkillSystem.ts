import Phaser from 'phaser';
import Hero from '../entities/Hero';
import Unit from '../entities/Unit';
import Structure from '../entities/Structure';
import Projectile from '../entities/Projectile';
import { skillConfigs } from '../config/skills';
import ParticleSystem from './ParticleSystem';
import { distance, normalize } from '../utils/math';

export default class SkillSystem {
  constructor(private scene: Phaser.Scene, private particles: ParticleSystem) {}

  cast(hero: Hero, slot: number, pointer: Phaser.Math.Vector2, units: Unit[], structures: Structure[], projectiles: Projectile[]) {
    const skillId = hero.skillIds[slot];
    const skill = skillConfigs[skillId];
    if (!skill || hero.cooldowns[skillId] > 0 || !hero.alive) return false;
    hero.cooldowns[skillId] = skill.cooldown;
    const dir = normalize(pointer.x - hero.x, pointer.y - hero.y);
    const enemies = units.filter((unit) => unit.team !== hero.team && unit.alive);
    const enemyStructures = structures.filter((structure) => structure.team !== hero.team && structure.alive);
    const color = hero.team === 'blue' ? 0x7dd3fc : 0xfb7185;

    if (skill.type === 'dash') {
      const distanceValue = skill.range || 180;
      hero.sprite.setPosition(hero.x + dir.x * distanceValue, hero.y + dir.y * distanceValue);
      this.particles.burst(hero.x, hero.y, color, 18);
      this.hitArea(hero, enemies, hero.x, hero.y, skill.radius || 70, skill.damage || 0);
      return true;
    }

    if (skill.type === 'shield') {
      const radius = skill.radius || 170;
      units.filter((unit) => unit.team === hero.team && unit.alive && distance(unit, hero) <= radius).forEach((unit) => {
        unit.shield += slot === 3 ? 150 : 90;
        this.particles.burst(unit.x, unit.y, 0x86efac, 6);
      });
      return true;
    }

    if (skill.type === 'heal') {
      units.filter((unit) => unit.team === hero.team && unit.alive && distance(unit, hero) <= (skill.radius || 220)).forEach((unit) => {
        unit.heal(65);
        this.particles.burst(unit.x, unit.y, 0x86efac, 8);
      });
      return true;
    }

    if (skill.type === 'buff') {
      hero.attackDamage += 8;
      hero.shield += 45;
      this.particles.burst(hero.x, hero.y, 0xfacc15, 16);
      this.scene.time.delayedCall(skill.duration || 2400, () => {
        if (!hero.sprite.active) return;
        hero.attackDamage = Math.max(1, hero.attackDamage - 8);
      });
      return true;
    }

    if (skill.type === 'projectile') {
      const count = skill.id === 'triple_star' ? 3 : 1;
      for (let index = 0; index < count; index += 1) {
        const angle = Math.atan2(dir.y, dir.x) + (index - (count - 1) / 2) * 0.12;
        projectiles.push(new Projectile(this.scene, {
          team: hero.team,
          x: hero.x,
          y: hero.y,
          angle,
          speed: 620,
          damage: skill.damage || hero.attackDamage,
          color,
          pierce: skill.id === 'piercing_star'
        }));
      }
      return true;
    }

    if (skill.type === 'area') {
      const x = hero.x + dir.x * Math.min(skill.range || 160, 220);
      const y = hero.y + dir.y * Math.min(skill.range || 160, 220);
      const radius = skill.radius || 150;
      const warning = this.scene.add.circle(x, y, radius, color, 0.08).setStrokeStyle(2, color, 0.5).setDepth(7);
      this.scene.tweens.add({ targets: warning, scaleX: 1.12, scaleY: 1.12, duration: 180, yoyo: true, onComplete: () => warning.destroy() });
      this.hitArea(hero, enemies, x, y, radius, skill.damage || 50);
      enemyStructures.forEach((structure) => {
        if (distance(structure, { x, y }) <= radius) structure.takeDamage((skill.damage || 50) * 0.45);
      });
      this.particles.burst(x, y, color, 22);
      return true;
    }

    return false;
  }

  private hitArea(hero: Hero, enemies: Unit[], x: number, y: number, radius: number, damage: number) {
    enemies.forEach((enemy) => {
      if (distance(enemy, { x, y }) <= radius) {
        enemy.takeDamage(damage + hero.level * 5);
        this.particles.burst(enemy.x, enemy.y, hero.team === 'blue' ? 0x7dd3fc : 0xfb7185, 10);
      }
    });
  }
}
