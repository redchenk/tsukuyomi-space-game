import type { TeamId } from '../../store/matchStore';
import CapturePoint from '../entities/CapturePoint';
import Hero from '../entities/Hero';
import TeamSystem from './TeamSystem';
import { distance } from '../utils/math';

export default class CapturePointSystem {
  constructor(private teamSystem: TeamSystem) {}

  update(points: CapturePoint[], heroes: Hero[], delta: number, feed: (message: string) => void) {
    const dt = delta / 1000;
    points.forEach((point) => {
      point.update(delta);
      if (point.cooldown > 0) return;
      const nearby = heroes.filter((hero) => hero.alive && distance(hero, point) <= 115);
      const blue = nearby.some((hero) => hero.team === 'blue');
      const red = nearby.some((hero) => hero.team === 'red');
      point.contested = blue && red;
      if (point.contested || (!blue && !red)) return;
      const team: TeamId = blue ? 'blue' : 'red';
      point.progress += dt * 28;
      if (point.progress >= 100) {
        point.owner = team;
        point.progress = 0;
        point.cooldown = 60;
        this.teamSystem.capture(team);
        nearby.filter((hero) => hero.team === team).forEach((hero) => {
          hero.gainExp(60);
          if (point.id === 'moon_spring') hero.heal(120);
          if (point.id === 'star_core') hero.attackDamage += 4;
        });
        feed(`${team === 'blue' ? '月辉队' : '星蚀队'}占领了${point.name}`);
      }
    });
  }
}
