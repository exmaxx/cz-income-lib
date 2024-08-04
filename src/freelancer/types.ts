/**
 * Income tax rates.
 */
export interface IncomeRates {
  rate: number
  /** "sleva na dani", value subtracted from the income tax subtotal */
  credit: number
  /** "odecitatelna polozka", value subtracted from the income tax base, i.e. amount that is not taxed */
  nonTaxable: number
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
 * Expenses can be either a flat-rate percentage or a fixed amount.
 *
 * @example
 * { amount: 1000000 } // fixed amount, meaning 1000000 CZK
 * { rate: 0.6 } // flat-rate percentage, meaning 60%
 */
export type Expenses =
  | { amount: number; percentage?: never }
  | { amount?: never; percentage: number }
