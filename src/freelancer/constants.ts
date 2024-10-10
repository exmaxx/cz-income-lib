// For 2023
export const AVG_SALARY_MONTHLY = 40324

/**
 * Maximum amount on which you can apply the flat rate.
 *
 * E.g. for income 3 000 000 CZK, you can apply the flat rate only on the first 2 000 000 CZK.
 * Meaning, the expenses will be 2 000 000 * 0.6 = 1 200 000 CZK.
 */
export const MAX_FLAT_RATE_AMOUNT = 2000000

/**
 * The thresholds that can be reached during the net income calculation.
 */
export const Thresholds = Object.freeze({
  HIGH_TAX: 'HIGH_TAX',
  MAX_BASE_SOCIAL: 'MAX_BASE_SOCIAL',
  MAX_FLAT_RATE: 'MAX_FLAT_RATE',
  MIN_BASE_HEALTH: 'MIN_BASE_HEALTH',
  MIN_BASE_SOCIAL: 'MIN_BASE_SOCIAL',
  ZERO_TAX: 'ZERO_TAX',
  ZERO_TAX_BASE: 'ZERO_TAX_BASE',
})
