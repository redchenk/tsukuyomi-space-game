import type { MinimapEntity } from '../../store/matchStore';
import Unit from '../entities/Unit';
import Structure from '../entities/Structure';
import CapturePoint from '../entities/CapturePoint';

export default class MinimapSystem {
  build(units: Unit[], structures: Structure[], captures: CapturePoint[]): MinimapEntity[] {
    return [
      ...structures.map((structure) => ({
        id: structure.id,
        type: structure.type as 'tower' | 'core',
        team: structure.team,
        x: structure.x,
        y: structure.y,
        visible: true
      })),
      ...captures.map((point) => ({
        id: point.id,
        type: 'resource' as const,
        team: point.owner || undefined,
        x: point.x,
        y: point.y,
        visible: true
      })),
      ...units.filter((unit) => unit.alive).map((unit) => ({
        id: unit.id,
        type: unit.kind,
        team: unit.team,
        x: unit.x,
        y: unit.y,
        visible: true
      }))
    ];
  }
}
