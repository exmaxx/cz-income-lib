/**
 * The thresholds that can be reached during the net income calculation.
 */
export const HighThresholds = {
  HIGH_TAX: 'HIGH_TAX',
  MAX_BASE_SOCIAL: 'MAX_BASE_SOCIAL',
  MAX_FLAT_RATE: 'MAX_FLAT_RATE',
} as const

export type HighThresholdKey = (typeof HighThresholds)[keyof typeof HighThresholds]

export const LowThresholds = {
  MIN_BASE_HEALTH: 'MIN_BASE_HEALTH',
  MIN_BASE_SOCIAL: 'MIN_BASE_SOCIAL',
  ZERO_TAX: 'ZERO_TAX',
  ZERO_TAX_BASE: 'ZERO_TAX_BASE',
} as const

export type LowThresholdKey = (typeof LowThresholds)[keyof typeof LowThresholds]

export const Thresholds = {
  ...HighThresholds,
  ...LowThresholds,
}

export type ThresholdKey = HighThresholdKey | LowThresholdKey
