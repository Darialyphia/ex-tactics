import type { Point } from '../types/geometry';
import type { Serializable } from '../types/utils';

export class Vec2 implements Serializable {
  static fromPoint(pt: Point) {
    return new Vec2(pt.x, pt.y);
  }

  static add(v1: Point, v2: Point) {
    return Vec2.fromPoint(v1).add(v2);
  }

  static sub(vec1: Point, vec2: Point) {
    return Vec2.fromPoint(vec1).sub(vec2);
  }

  static mul(vec1: Point, vec2: Point) {
    return Vec2.fromPoint(vec1).scale(vec2);
  }

  static div(vec1: Point, vec2: Point) {
    return Vec2.fromPoint(vec1).div(vec2);
  }

  constructor(
    public x: number,
    public y: number
  ) {}

  serialize() {
    return { x: this.x, y: this.y };
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  get magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  set magnitude(mag: number) {
    this.normalize().scale({ x: mag, y: mag });
  }

  setMagnitude(mag: number) {
    this.magnitude = mag;
    return this;
  }

  normalize() {
    const mag = this.magnitude;
    if (mag === 0) return this;

    this.x /= mag;
    this.y /= mag;

    return this;
  }

  equals(vec: Point) {
    return this.x === vec.x && this.y === vec.y;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);

    return this;
  }

  add({ x, y }: Point) {
    this.x += x;
    this.y += y;

    return this;
  }

  sub({ x, y }: Point) {
    this.x -= x;
    this.y -= y;

    return this;
  }

  scale({ x, y }: Point) {
    this.x *= x;
    this.y *= y;

    return this;
  }

  div({ x, y }: Point) {
    this.x /= x;
    this.y /= y;

    return this;
  }

  rotate(degrees: 90 | 180 | 270) {
    let temp: number;
    switch (degrees % 360) {
      case 90:
        temp = this.x;
        this.x = -this.y;
        this.y = temp;
        break;
      case 180:
        this.x = -this.x;
        this.y = -this.y;
        break;
      case 270:
        temp = this.x;
        this.x = this.y;
        this.y = -temp;
        break;
      case 0:
        // No rotation
        break;
      default:
        throw new Error('Rotation must be 0, 90, 180, or 270 degrees');
    }
    return this;
  }

  dist({ x, y }: Point) {
    const diff = {
      x: x - this.x,
      y: y - this.y
    };

    return Math.sqrt(diff.x ** 2 + diff.y ** 2);
  }
}
