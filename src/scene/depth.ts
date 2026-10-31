/**
 * Art-directed relative motion for the portrait photograph. Coordinates are
 * normalized, with (0, 0) at the top left. This is not a depth estimate.
 */
export function authoredDepth(x: number, y: number): number {
  const smoothstep = (edge0: number, edge1: number, value: number): number => {
    const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };

  // Broad, feathered regions prevent discontinuities and exposed holes.
  const forest = smoothstep(0.36, 0.52, y);
  const lake = smoothstep(0.50, 0.72, y);
  const rightBank = smoothstep(0.40, 0.83, x) * smoothstep(0.48, 0.67, y) * (1 - smoothstep(0.76, 0.90, y));
  const rightPine = (1 - smoothstep(0.0, 0.20, Math.abs(x - 0.68))) * smoothstep(0.45, 0.57, y) * (1 - smoothstep(0.70, 0.80, y));
  return Math.min(1, 0.035 + 0.12 * forest + 0.22 * lake + 0.48 * rightBank + 0.12 * rightPine);
}
