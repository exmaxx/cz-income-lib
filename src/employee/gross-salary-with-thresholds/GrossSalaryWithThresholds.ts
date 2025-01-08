import { Rates } from '../types'
import { ThresholdKey } from '../enums'
import { HealthModifiers } from './health/HealthModifiers'
import { SocialModifiers } from './social/SocialModifiers'
import { TaxModifiers } from './tax/TaxModifiers'

export default class GrossSalaryCalculatorWithRules {
  constructor(
    private readonly taxModifiers: TaxModifiers,
    private readonly socialModifiers: SocialModifiers,
    private readonly healthCalculator: HealthModifiers
  ) {}

  static create(rates: Rates) {
    return new GrossSalaryCalculatorWithRules(
      new TaxModifiers(rates),
      new SocialModifiers(rates),
      new HealthModifiers(rates)
    )
  }

  /**
   * Calculate gross salary based on net salary and threshold that should be applied.
   *
   * @param netSalary
   * @param thresholds
   * @return gross salary
   */
  calculate(netSalary: number, thresholds: ThresholdKey[] = []): number {
    const tax = this.taxModifiers.get(thresholds)
    const social = this.socialModifiers.get(thresholds)
    const health = this.healthCalculator.get(thresholds)

    const adjustedNetSalary = netSalary - tax.amount + social.amount + health.amount

    const rates = 1 - (tax.rate + social.rate + health.rate)

    return adjustedNetSalary / rates
  }
}
