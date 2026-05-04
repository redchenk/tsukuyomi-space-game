import { useMatchStore } from '../store/matchStore';
import SkillBar from './SkillBar';
import Minimap from './Minimap';

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export default function BattleHUD() {
  const hud = useMatchStore((state) => state.hud);
  const pause = useMatchStore((state) => state.pauseMatch);
  const hpRatio = Math.max(0, Math.min(1, hud.playerHp / hud.playerMaxHp));
  const blueCore = Math.max(0, Math.round(hud.teams.blue.coreHp));
  const redCore = Math.max(0, Math.round(hud.teams.red.coreHp));

  return (
    <section className="battle-hud">
      <div className="top-score glass-panel">
        <div className="team-score blue"><strong>{hud.teams.blue.score}</strong><span>月辉队</span></div>
        <div className="timer"><small>比赛时间</small><strong>{formatTime(hud.timeLeft)}</strong></div>
        <div className="team-score red"><strong>{hud.teams.red.score}</strong><span>星蚀队</span></div>
      </div>

      <div className="core-strip glass-panel">
        <span>蓝核心 {blueCore}</span>
        <i><b style={{ transform: `scaleX(${hud.teams.blue.coreHp / hud.teams.blue.maxCoreHp})` }} /></i>
        <i><b className="red-fill" style={{ transform: `scaleX(${hud.teams.red.coreHp / hud.teams.red.maxCoreHp})` }} /></i>
        <span>红核心 {redCore}</span>
      </div>

      <Minimap />

      <div className="bottom-hud glass-panel">
        <div className="player-card">
          <div className="level-badge">{hud.playerLevel}</div>
          <div className="hp-block">
            <div className="hp-label"><span>月刃使</span><strong>{Math.ceil(hud.playerHp)} / {hud.playerMaxHp}</strong></div>
            <div className="hp-bar"><i style={{ transform: `scaleX(${hpRatio})` }} /></div>
          </div>
          <div className="kda"><span>{hud.playerKills}</span>/<span>{hud.playerDeaths}</span>/<span>{hud.playerAssists}</span></div>
        </div>
        <SkillBar />
        <button className="icon-btn" type="button" onClick={pause} aria-label="暂停">II</button>
      </div>

      <div className="capture-row">
        {hud.captures.map((point) => (
          <div key={point.id} className={`capture-pill ${point.owner || ''}`}>
            <span>{point.name}</span>
            <b>{point.cooldown > 0 ? `${Math.ceil(point.cooldown)}s` : point.contested ? '争夺中' : `${Math.round(point.progress)}%`}</b>
          </div>
        ))}
      </div>

      <div className="kill-feed">
        {hud.killFeed.map((item, index) => <div key={`${item}-${index}`}>{item}</div>)}
      </div>
    </section>
  );
}
