import GameContainer from './components/GameContainer';
import BattleHUD from './components/BattleHUD';
import MainMenu from './components/MainMenu';
import SettingsPanel from './components/SettingsPanel';
import ScoreBoard from './components/ScoreBoard';
import MobileControls from './components/MobileControls';
import { useMatchStore } from './store/matchStore';

export default function App() {
  const screen = useMatchStore((state) => state.screen);
  const result = useMatchStore((state) => state.result);
  const scoreboardOpen = useMatchStore((state) => state.scoreboardOpen);
  const startMatch = useMatchStore((state) => state.startMatch);
  const resumeMatch = useMatchStore((state) => state.resumeMatch);
  const returnToMenu = useMatchStore((state) => state.returnToMenu);
  const openSettings = useMatchStore((state) => state.openSettings);
  const closeSettings = useMatchStore((state) => state.closeSettings);

  return (
    <main className="app-shell">
      <GameContainer />
      <div className="ui-layer">
        {screen === 'menu' && <MainMenu onStart={() => startMatch('standard')} onDemo={() => startMatch('demo')} onSettings={openSettings} />}
        {screen === 'playing' && <><BattleHUD /><MobileControls /></>}
        {screen === 'paused' && (
          <section className="modal glass-panel">
            <span className="kicker">Paused</span>
            <h1>战局暂停</h1>
            <div className="button-row">
              <button className="primary-btn" type="button" onClick={resumeMatch}>继续对战</button>
              <button className="ghost-btn" type="button" onClick={openSettings}>设置</button>
              <button className="ghost-btn" type="button" onClick={returnToMenu}>返回菜单</button>
            </div>
          </section>
        )}
        {screen === 'settings' && <SettingsPanel onClose={closeSettings} />}
        {screen === 'result' && (
          <section className="modal result-modal glass-panel">
            <span className="kicker">{result?.winner === 'blue' ? 'Moonlight Victory' : result?.winner === 'red' ? 'Eclipse Victory' : 'Draw'}</span>
            <h1>{result?.title || '结算'}</h1>
            <p>{result?.reason}</p>
            <div className="result-grid">
              <div><small>蓝方积分</small><strong>{result?.blueScore ?? 0}</strong></div>
              <div><small>红方积分</small><strong>{result?.redScore ?? 0}</strong></div>
              <div><small>用时</small><strong>{result?.elapsed.toFixed(0) ?? 0}s</strong></div>
            </div>
            <div className="button-row">
              <button className="primary-btn" type="button" onClick={() => startMatch('standard')}>再来一局</button>
              <button className="ghost-btn" type="button" onClick={returnToMenu}>返回菜单</button>
            </div>
          </section>
        )}
        {scoreboardOpen && <ScoreBoard />}
      </div>
    </main>
  );
}
