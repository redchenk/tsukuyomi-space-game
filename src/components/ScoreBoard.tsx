import { useMatchStore } from '../store/matchStore';

export default function ScoreBoard() {
  const heroes = useMatchStore((state) => state.hud.heroes);
  return (
    <section className="scoreboard glass-panel">
      <h2>计分面板</h2>
      <div className="scoreboard-grid head">
        <span>英雄</span><span>阵营</span><span>K</span><span>D</span><span>A</span><span>等级</span>
      </div>
      {heroes.map((hero) => (
        <div key={hero.id} className={`scoreboard-grid ${hero.team}`}>
          <strong>{hero.name}{hero.isPlayer ? ' / 你' : ''}</strong>
          <span>{hero.team === 'blue' ? '月辉' : '星蚀'}</span>
          <span>{hero.kills}</span>
          <span>{hero.deaths}</span>
          <span>{hero.assists}</span>
          <span>{hero.level}</span>
        </div>
      ))}
    </section>
  );
}
