export interface Vec2 {
  x: number;
  y: number;
}

export function distance(a: Vec2, b: Vec2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalize(x: number, y: number) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

export function moveToward(current: Vec2, target: Vec2, maxDistance: number) {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const length = Math.hypot(dx, dy);
  if (length <= maxDistance || length === 0) return { ...target };
  return { x: current.x + (dx / length) * maxDistance, y: current.y + (dy / length) * maxDistance };
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
