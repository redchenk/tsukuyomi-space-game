import Structure from '../entities/Structure';
import Unit from '../entities/Unit';
import Projectile from '../entities/Projectile';
import CombatSystem from './CombatSystem';
import { nearestEnemy } from '../utils/target';

export default class TowerSystem {
  constructor(private combat: CombatSystem) {}

  update(towers: Structure[], units: Unit[], projectiles: Projectile[], delta: number) {
    towers.forEach((tower) => {
      tower.update(delta);
      if (!tower.canAttack()) return;
      const target = nearestEnemy(tower, units, tower.attackRange);
      if (!target) return;
      tower.markAttack();
      this.combat.projectileAttack(tower, target, projectiles, tower.attackDamage, 640);
    });
  }
}
