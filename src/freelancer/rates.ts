import { HealthInsuranceRates, IncomeRates, SocialInsuranceRates } from './types'

export class Rates {
  incomeRates: IncomeRates
  socialRates: SocialInsuranceRates
  healthRates: HealthInsuranceRates

  constructor(
    incomeRates: IncomeRates,
    socialRates: SocialInsuranceRates,
    healthRates: HealthInsuranceRates
  ) {
    this.incomeRates = incomeRates
    this.socialRates = socialRates
    this.healthRates = healthRates
  }

  get minDeductions() {
    return (
      this.healthRates.minBase * this.healthRates.rate +
      this.socialRates.minBase * this.socialRates.rate
    )
  }
}
