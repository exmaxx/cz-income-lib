/**
 * Checks if two numbers are close enough to be considered equal within a given tolerance.
 *
 * @param a
 * @param b
 * @param tolerance - The maximum difference between the two numbers. Default: 0.1%
 */
export function isAlmostEqual(a: number, b: number, tolerance: number = 0.001): boolean {
  return Math.abs(a - b) <= tolerance * Math.max(a, b)
}
