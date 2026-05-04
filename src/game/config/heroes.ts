import type { Role } from '../../store/matchStore';

export interface HeroConfig {
  id: string;
  name: string;
  role: Role;
  maxHp: number;
  attackDamage: number;
  attackRange: number;
  attackInterval: number;
  moveSpeed: number;
  color: number;
  skills: string[];
}

export const heroConfigs: HeroConfig[] = [
  {
    id: 'moon_blade',
    name: '月刃使',
    role: 'fighter',
    maxHp: 680,
    attackDamage: 42,
    attackRange: 84,
    attackInterval: 0.82,
    moveSpeed: 260,
    color: 0x7dd3fc,
    skills: ['moon_dash', 'moon_shield', 'crescent_slash', 'fullmoon_break']
  },
  {
    id: 'star_archer',
    name: '星弓手',
    role: 'marksman',
    maxHp: 460,
    attackDamage: 34,
    attackRange: 360,
    attackInterval: 0.7,
    moveSpeed: 245,
    color: 0xa78bfa,
    skills: ['triple_star', 'back_step', 'star_mark', 'piercing_star']
  },
  {
    id: 'lunar_mage',
    name: '幻月术士',
    role: 'mage',
    maxHp: 420,
    attackDamage: 28,
    attackRange: 310,
    attackInterval: 0.95,
    moveSpeed: 240,
    color: 0xf0abfc,
    skills: ['starfall', 'moon_ring', 'phase_shift', 'tsukuyomi_field']
  },
  {
    id: 'star_lamp',
    name: '星灯使',
    role: 'support',
    maxHp: 520,
    attackDamage: 22,
    attackRange: 280,
    attackInterval: 0.88,
    moveSpeed: 250,
    color: 0x86efac,
    skills: ['lamp_heal', 'bind_light', 'slow_field', 'stellar_guard']
  }
];

export function heroConfig(id: string) {
  return heroConfigs.find((item) => item.id === id) || heroConfigs[0];
}
