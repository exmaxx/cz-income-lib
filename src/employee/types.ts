export interface IncomeRates {
  /** The income tax rate applicable to the employee's income */
  rate: number
  /** The credit that is subtracted from the resulting tax */
  credit: number
  /** The minimum allowed salary */
  minSalary: number
  /** The higher income tax rate */
  highRate: number
  /** The threshold for the higher income tax rate */
  highRateThreshold: number
}

export interface SocialInsuranceRates {
  /** Social security rate for the employee */
  employeeRate: number
  /** Social security rate for the employer */
  employerRate: number
  /** The maximum base for social security contributions */
  maxBase: number
}

export interface HealthInsuranceRates {
  /** Health insurance rate for the employee */
  employeeRate: number
  /** Health insurance rate for the employer */
  employerRate: number
  /** The minimum health insurance contributions */
  minAmount: number
}

// TODO: Add Sickness Benefits Rates

export interface Rates {
  incomeRates: IncomeRates
  socialRates: SocialInsuranceRates
  healthRates: HealthInsuranceRates
}

/**
 * Options for the net income calculation.
 */
export interface NetIncomeCalculationOptions {
  /** Is:
   * - `true` - for normal calculation; the law requires some roundings (up, down, some to single digit,
   *   some to hundreds, etc.)
   * - `false` - for double-checking previously calculated gross income (using the [grossIncome](./gross-income/grossIncome.ts) function),
   *   I need to disable rounding because the gross income calculation (which reverts net income calculation)
   *   is not able to guess what roundings were used in the original net income calculation
   */
  isRoundingEnabled?: boolean
}
