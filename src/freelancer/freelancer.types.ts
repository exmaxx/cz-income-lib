interface IncomeRates {
  rate: number
  /** value subtracted from the resulting income tax */
  credit: number
  /** value subtracted from the income tax base */
  nonTaxable: number
}

interface SocialInsuranceRates {
  /** assessment base rate for social and health insurance (calculated from income tax base) */
  basePercentage: number
  /** maximum assessment base, 48-times average salary */
  maxBase: number
  /** minimum assessment base */
  minBase: number
  /** rate (as a percentage) */
  rate: number
}

interface HealthInsuranceRates {
  /** assessment base rate for social and health insurance (calculated from income tax base) */
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
