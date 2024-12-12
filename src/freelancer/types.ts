/**
 * Income tax rates.
 */
export interface IncomeRates {
  rate: number
  /** "sleva na dani", value subtracted from the income tax subtotal */
  credit: number
  /** "odecitatelna polozka", value subtracted from the income tax base, i.e. amount that is not taxed */
  nonTaxable: number
  /** The higher income tax rate */
  highRate: number
  /** The threshold for the higher income tax rate */
  highRateThreshold: number
}

/**
 * Social insurance rates.
 */
export interface SocialInsuranceRates {
  /** "vymerovaci zaklad - procento ze zakladu dane", assessment base rate for social and health insurance (calculated from income tax base) */
  basePercentage: number
  /** maximum assessment base, 48-times average salary */
  maxBase: number
  /** minimum assessment base */
  minBase: number
  /** rate (as a percentage) */
  rate: number
}

/**
 * Health insurance rates.
 */
export interface HealthInsuranceRates {
  /** "vymerovaci zaklad - procento ze zakladu dane", assessment base rate for social and health insurance (calculated from income tax base) */
  basePercentage: number
  /** minimum assessment base */
  minBase: number
  /** rate (as a percentage) */
  rate: number
}

/**
 * Rates for income tax, social insurance, and health insurance.
 */
export interface IRates {
  incomeRates: IncomeRates
  socialRates: SocialInsuranceRates
  healthRates: HealthInsuranceRates
}

/**
 * Expenses can be either a flat-rate percentage or a fixed amount.
 *
 * @example
 * { amount: 1000000 } // fixed amount, meaning 1000000 CZK
 * { rate: 0.6 } // flat-rate percentage, meaning 60%
 */
export type Expenses =
  | { amount: number; percentage?: never }
  | { amount?: never; percentage: number }

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

/**
 * The result of the net income calculation.
 */
export interface NetIncomeResult {
  health: number;
  healthAssessmentBase: number;
  incomeTax: number;
  incomeTaxBase: number;
  incomeTaxWithHighRate: number;
  incomeTaxWithLowRate: number;
  netIncome: number;
  reachedThresholds: string[];
  social: number;
  socialAssessmentBase: number;
}
