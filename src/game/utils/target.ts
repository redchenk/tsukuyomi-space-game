import type Unit from '../entities/Unit';
import type Structure from '../entities/Structure';
import type { TeamId } from '../../store/matchStore';
import { distance } from './math';

export type Targetable = Unit | Structure;

export function nearestEnemy<T extends Targetable>(source: { x: number; y: number; team: TeamId }, targets: T[], range = Infinity) {
  return targets
    .filter((target) => target.team !== source.team && target.alive)
    .map((target) => ({ target, dist: distance(source, target) }))
    .filter((item) => item.dist <= range)
    .sort((a, b) => a.dist - b.dist)[0]?.target || null;
}
