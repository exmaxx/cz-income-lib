export interface IncomeRates {
  /** The income tax rate applicable to the employee's income */
  rate: number
  /** The credit that is subtracted from the resulting tax */
  credit: number
}

export interface SocialInsuranceRates {
  /** Social security rate for the employee */
  employeeRate: number
  /** Social security rate for the employer */
  employerRate: number
}

export interface HealthInsuranceRates {
  /** Health insurance rate for the employee */
  employeeRate: number
  /** Health insurance rate for the employer */
  employerRate: number
}

// TODO: Add Sickness Benefits Rates

export type Rates = {
  incomeRates: IncomeRates
  socialRates: SocialInsuranceRates
  healthRates: HealthInsuranceRates
}
