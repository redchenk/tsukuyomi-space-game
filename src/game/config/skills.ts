export interface SkillConfig {
  id: string;
  name: string;
  type: 'projectile' | 'area' | 'dash' | 'buff' | 'heal' | 'shield';
  cooldown: number;
  damage?: number;
  range?: number;
  radius?: number;
  duration?: number;
}

export const skillConfigs: Record<string, SkillConfig> = {
  moon_dash: { id: 'moon_dash', name: '月影突进', type: 'dash', cooldown: 6, damage: 58, range: 260, radius: 72 },
  moon_shield: { id: 'moon_shield', name: '护月屏障', type: 'shield', cooldown: 9, duration: 2600 },
  crescent_slash: { id: 'crescent_slash', name: '弦月斩', type: 'area', cooldown: 7, damage: 70, radius: 150 },
  fullmoon_break: { id: 'fullmoon_break', name: '满月裂斩', type: 'area', cooldown: 32, damage: 150, radius: 230 },
  triple_star: { id: 'triple_star', name: '三连星矢', type: 'projectile', cooldown: 7, damage: 30, range: 540 },
  back_step: { id: 'back_step', name: '后撤步', type: 'dash', cooldown: 8, range: 190 },
  star_mark: { id: 'star_mark', name: '星痕标记', type: 'buff', cooldown: 12, duration: 2800 },
  piercing_star: { id: 'piercing_star', name: '贯星之箭', type: 'projectile', cooldown: 30, damage: 120, range: 780 },
  starfall: { id: 'starfall', name: '星落', type: 'area', cooldown: 8, damage: 82, radius: 150 },
  moon_ring: { id: 'moon_ring', name: '月环', type: 'area', cooldown: 10, damage: 60, radius: 170 },
  phase_shift: { id: 'phase_shift', name: '相位移', type: 'dash', cooldown: 9, range: 180 },
  tsukuyomi_field: { id: 'tsukuyomi_field', name: '月读领域', type: 'area', cooldown: 34, damage: 135, radius: 260 },
  lamp_heal: { id: 'lamp_heal', name: '星灯治疗', type: 'heal', cooldown: 8, radius: 220 },
  bind_light: { id: 'bind_light', name: '束缚光线', type: 'projectile', cooldown: 11, damage: 28, range: 420 },
  slow_field: { id: 'slow_field', name: '缓速星域', type: 'area', cooldown: 13, damage: 24, radius: 180 },
  stellar_guard: { id: 'stellar_guard', name: '群星庇护', type: 'shield', cooldown: 36, radius: 260, duration: 3200 }
};
