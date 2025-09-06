import type { Point3D } from '@game/shared';

export function bresenham3D(a: Point3D, b: Point3D): Point3D[] {
  let x0 = Math.round(a.x),
    y0 = Math.round(a.y),
    z0 = Math.round(a.z);
  const x1 = Math.round(b.x),
    y1 = Math.round(b.y),
    z1 = Math.round(b.z);

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const dz = Math.abs(z1 - z0);

  const sx = x1 >= x0 ? 1 : -1;
  const sy = y1 >= y0 ? 1 : -1;
  const sz = z1 >= z0 ? 1 : -1;

  const points: Point3D[] = [];

  // Degenerate case
  if (dx === 0 && dy === 0 && dz === 0) {
    points.push({ x: x0, y: y0, z: z0 });
    return points;
  }

  // Choose dominant axis and run Bresenham with two error terms
  if (dx >= dy && dx >= dz) {
    let errY = 2 * dy - dx;
    let errZ = 2 * dz - dx;
    for (let i = 0; i <= dx; i++) {
      points.push({ x: x0, y: y0, z: z0 });
      if (errY >= 0) {
        y0 += sy;
        errY -= 2 * dx;
      }
      if (errZ >= 0) {
        z0 += sz;
        errZ -= 2 * dx;
      }
      errY += 2 * dy;
      errZ += 2 * dz;
      x0 += sx;
    }
  } else if (dy >= dx && dy >= dz) {
    let errX = 2 * dx - dy;
    let errZ = 2 * dz - dy;
    for (let i = 0; i <= dy; i++) {
      points.push({ x: x0, y: y0, z: z0 });
      if (errX >= 0) {
        x0 += sx;
        errX -= 2 * dy;
      }
      if (errZ >= 0) {
        z0 += sz;
        errZ -= 2 * dy;
      }
      errX += 2 * dx;
      errZ += 2 * dz;
      y0 += sy;
    }
  } else {
    let errX = 2 * dx - dz;
    let errY = 2 * dy - dz;
    for (let i = 0; i <= dz; i++) {
      points.push({ x: x0, y: y0, z: z0 });
      if (errX >= 0) {
        x0 += sx;
        errX -= 2 * dz;
      }
      if (errY >= 0) {
        y0 += sy;
        errY -= 2 * dz;
      }
      errX += 2 * dx;
      errY += 2 * dy;
      z0 += sz;
    }
  }

  return points;
}
