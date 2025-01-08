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

/**
 * Deep clones an object. Omits anything that is not supported by JSON (e.g. functions).
 *
 * @param obj
 */
export function deepCloneSimple<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Rounds a number up, when rounding is enabled.
 *
 * @param amount
 * @param isRoundingEnabled
 */
export function maybeToCeil(amount: number, isRoundingEnabled = true): number {
  return isRoundingEnabled ? Math.ceil(amount) : amount
}
