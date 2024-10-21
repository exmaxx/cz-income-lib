/**
 * Checks if two numbers are close enough to be considered equal within a given tolerance.
 * Solve the floating-point problem in JavaScript.
 *
 * @param a
 * @param b
 */
export function areTechnicallyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= 0.0000001
}
