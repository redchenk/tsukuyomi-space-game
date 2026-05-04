import { useMatchStore } from '../store/matchStore';

export default function SkillBar() {
  const skills = useMatchStore((state) => state.hud.skills);
  return (
    <div className="skill-bar">
      {skills.map((skill) => {
        const ratio = Math.max(0, Math.min(1, skill.cooldown / skill.maxCooldown));
        return (
          <div key={skill.key} className={`skill-slot ${skill.cooldown <= 0 ? 'ready' : ''}`}>
            <span>{skill.key}</span>
            <strong>{skill.name}</strong>
            {skill.cooldown > 0 && <i style={{ transform: `scaleY(${ratio})` }} />}
            <em>{skill.cooldown > 0 ? skill.cooldown.toFixed(1) : 'READY'}</em>
          </div>
        );
      })}
    </div>
  );
}
