import type { TeamId } from '../../store/matchStore';
import { matchConfig } from '../config/match';

export default class TeamSystem {
  scores: Record<TeamId, number> = { blue: 0, red: 0 };

  add(team: TeamId, amount: number) {
    this.scores[team] += Math.max(0, Math.floor(amount));
  }

  heroKill(team: TeamId) {
    this.add(team, matchConfig.score.heroKill);
  }

  minionKill(team: TeamId, bonus = 0) {
    this.add(team, matchConfig.score.minionKill + bonus);
  }

  towerDestroy(team: TeamId) {
    this.add(team, matchConfig.score.towerDestroy);
  }

  capture(team: TeamId) {
    this.add(team, matchConfig.score.capturePoint);
  }

  coreDamage(team: TeamId, damage: number) {
    this.add(team, damage / matchConfig.score.coreDamageDivisor);
  }
}
