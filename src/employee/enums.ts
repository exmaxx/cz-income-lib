export const HighThresholds = {
  HIGH_TAX: 'HIGH_TAX',
  MAX_BASE_SOCIAL: 'MAX_BASE_SOCIAL',
} as const

export const LowThresholds = {
  MIN_HEALTH: 'MIN_HEALTH',
  ZERO_TAX: 'ZERO_TAX',
} as const

/**
 * The thresholds that can be reached during the net salary calculation.
 */
export const Thresholds = {
  ...HighThresholds,
  ...LowThresholds,
}

export type HighThresholdKey = (typeof HighThresholds)[keyof typeof HighThresholds]

export type LowThresholdKey = (typeof LowThresholds)[keyof typeof LowThresholds]

export type ThresholdKey = HighThresholdKey | LowThresholdKey
