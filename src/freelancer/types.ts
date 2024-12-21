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
export interface Rates {
  incomeRates: IncomeRates
  socialRates: SocialInsuranceRates
  healthRates: HealthInsuranceRates
}

/**
 * Expenses defined by an exact amount.
 *
 * Note: This approach, using `never`, has advantages:
 *   1. It allows for destructuring
 *   2. It enables the use of `expenses.amount` instead of `expenses in expenses` in `if` statements
 *
 * One disadvantage is that when `expenses.percentage` is `true`, `expenses.amount` can still be `undefined` and
 * must be checked.
 */
export type ExactExpenses = { amount: number; percentage?: never }

/**
 * Expenses defined by a percentage of the gross income.
 */
export type PercentageExpenses = { amount?: never; percentage: number }

/**
 * Expenses can be either a flat-rate percentage or a fixed amount.
 *
 * @example
 * { amount: 1000000 } // fixed amount, meaning 1000000 CZK
 * { rate: 0.6 } // flat-rate percentage, meaning 60%
 */
export type Expenses = ExactExpenses | PercentageExpenses

/**
 * These coefficients will be passed to the grand equation of the gross income calculation (i.e.
 * reverse of the net income formula).
 *
 * Income adjustments at the top of the fraction.
 * Income multiplier at the bottom of the fraction.
 */
export interface CalculationModifiers {
  /**
   * The amount that is originally subtracted from the gross income when calculation the net income.
   *
   * This is used at the grand equation for the gross income calculation. All the gross income
   * adjustments are added or subtracted from the net income.
   *
   * Any fixed values (e.g. real expenses) are added here.
   */
  grossIncomeAdjustment: number

  /** The multiplier of the gross income in the original calculation of the net income.
   *
   * All the variable multipliers of the gross income belong here (e.g. flat-rate percentage value).
   */
  grossIncomeMultiplier: number
}
