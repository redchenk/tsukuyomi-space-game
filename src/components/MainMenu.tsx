interface MainMenuProps {
  onStart: () => void;
  onDemo: () => void;
  onSettings: () => void;
}

export default function MainMenu({ onStart, onDemo, onSettings }: MainMenuProps) {
  return (
    <section className="menu-panel glass-panel">
      <span className="kicker">Tsukiyomi Arena</span>
      <h1>月读竞技场</h1>
      <p>3v3 轻量 MOBA 对抗。推进小兵、争夺资源点、击破防御塔，摧毁敌方核心。</p>
      <div className="mode-grid">
        <button className="primary-btn" type="button" onClick={onStart}>标准 3v3</button>
        <button className="ghost-btn" type="button" onClick={onDemo}>AI 演示</button>
        <button className="ghost-btn" type="button" onClick={onSettings}>设置</button>
      </div>
      <div className="control-card">
        <strong>默认操作</strong>
        <span>右键移动，A/左键普攻，Q/W/E/R 技能，Space 回到自己，Tab 计分板。</span>
      </div>
    </section>
  );
}
