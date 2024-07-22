export interface IncomeRates {
  rate: number
  /** "sleva na dani", value subtracted from the income tax subtotal */
  credit: number
  /** "odecitatelna polozka", value subtracted from the income tax base, i.e. amount that is not taxed */
  nonTaxable: number
}

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

export interface HealthInsuranceRates {
  /** "vymerovaci zaklad - procento ze zakladu dane", assessment base rate for social and health insurance (calculated from income tax base) */
  basePercentage: number
  /** minimum assessment base */
  minBase: number
  /** rate (as a percentage) */
  rate: number
}

export type Rates = {
  incomeRates: IncomeRates
  socialRates: SocialInsuranceRates
  healthRates: HealthInsuranceRates
}

export type Expenses = { amount: number; rate?: never } | { amount?: never; rate: number }
