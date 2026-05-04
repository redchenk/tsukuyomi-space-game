import { useMatchStore } from '../store/matchStore';
import { mapConfig } from '../game/config/map';

export default function Minimap() {
  const entities = useMatchStore((state) => state.hud.minimap);
  return (
    <div className="minimap glass-panel">
      <div className="minimap-lane" />
      {entities.map((entity) => (
        <span
          key={entity.id}
          className={`mini-dot ${entity.type} ${entity.team || ''}`}
          style={{
            left: `${(entity.x / mapConfig.width) * 100}%`,
            top: `${(entity.y / mapConfig.height) * 100}%`
          }}
        />
      ))}
    </div>
  );
}
