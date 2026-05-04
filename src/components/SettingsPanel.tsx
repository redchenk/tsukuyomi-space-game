import { useMatchStore, type ControlMode } from '../store/matchStore';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const settings = useMatchStore((state) => state.settings);
  const updateSettings = useMatchStore((state) => state.updateSettings);

  return (
    <section className="modal settings-panel glass-panel">
      <span className="kicker">Settings</span>
      <h1>竞技场设置</h1>
      <label>音量 <strong>{settings.volume}%</strong><input type="range" min="0" max="100" value={settings.volume} onChange={(event) => updateSettings({ volume: Number(event.target.value) })} /></label>
      <label>画质
        <select value={settings.quality} onChange={(event) => updateSettings({ quality: event.target.value as 'low' | 'medium' | 'high' })}>
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
      </label>
      <label>操作模式
        <select value={settings.controlMode} onChange={(event) => updateSettings({ controlMode: event.target.value as ControlMode })}>
          <option value="moba">MOBA 鼠标模式</option>
          <option value="wasd">WASD 动作模式</option>
        </select>
      </label>
      <label className="check-row"><input type="checkbox" checked={settings.mobileControls} onChange={(event) => updateSettings({ mobileControls: event.target.checked })} />移动端虚拟按键</label>
      <label className="check-row"><input type="checkbox" checked={settings.screenShake} onChange={(event) => updateSettings({ screenShake: event.target.checked })} />团战屏幕震动</label>
      <button className="primary-btn" type="button" onClick={onClose}>完成</button>
    </section>
  );
}
