import { mapConfig } from '../config/map';
import type { TeamId } from '../../store/matchStore';

export function lanePathForTeam(team: TeamId) {
  return team === 'blue' ? mapConfig.lanePath : [...mapConfig.lanePath].reverse();
}
