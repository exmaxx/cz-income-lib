import { HealthInsuranceRates, IncomeRates, Rates, SocialInsuranceRates } from '../../types'
import { ThresholdKey, Thresholds } from '../../enums'
import TaxCalculator from '../../net-salary/tax/TaxCalculator'

export class ThresholdsChecker {
  private readonly incomeRates: IncomeRates
  private readonly socialRates: SocialInsuranceRates
  private readonly healthRates: HealthInsuranceRates

  constructor(rates: Rates) {
    this.incomeRates = rates.incomeRates
    this.socialRates = rates.socialRates
    this.healthRates = rates.healthRates
  }

  static getLowSalaryThresholdSets() {
    return [[], [Thresholds.MIN_HEALTH], [Thresholds.MIN_HEALTH, Thresholds.ZERO_TAX]]
  }

  static getHighSalaryThresholdSets() {
    return [[], [Thresholds.HIGH_TAX], [Thresholds.HIGH_TAX, Thresholds.MAX_BASE_SOCIAL]]
  }

  /**
   * Checks the calculation thresholds that might have been reached.
   *
   * @param salary - Yearly salary
   */
  check(salary: number): Set<ThresholdKey> {
    const { HIGH_TAX, MAX_BASE_SOCIAL, ZERO_TAX, MIN_HEALTH } = Thresholds

    const reachedThresholds = new Set<ThresholdKey>()

    if (this.hitsMinimumHealth(salary)) {
      reachedThresholds.add(MIN_HEALTH)
    }

    if (this.hitsZeroTax(salary)) {
      reachedThresholds.add(ZERO_TAX)
    }

    if (this.hitsHighTax(salary)) {
      reachedThresholds.add(HIGH_TAX)
    }

    if (this.hitsMaxSocialBase(salary)) {
      reachedThresholds.add(MAX_BASE_SOCIAL)
    }

    return reachedThresholds
  }

  /**
   * Checks if the health insurance contributions based on the salary are less than the minimum amount.
   *
   * @param salary
   */
  private hitsMinimumHealth(salary: number): boolean {
    const { minAmount, employeeRate, employerRate } = this.healthRates

    const employeeHealth = salary * employeeRate
    const employerHealth = salary * employerRate

    const healthTotal = employeeHealth + employerHealth

    return healthTotal < minAmount
  }

  /**
   * Checks if the salary is less than the zero tax base.
   *
   * @param salary
   */
  private hitsZeroTax(salary: number): boolean {
    const taxCalculator = new TaxCalculator(this.incomeRates)

    const { incomeTax } = taxCalculator.calculate(salary, { isRoundingEnabled: false })

    return incomeTax === 0
  }

  /**
   * Checks if the salary is higher than the high tax threshold.
   *
   * @param salary
   */
  private hitsHighTax(salary: number): boolean {
    const { highRateThreshold } = this.incomeRates

    return salary > highRateThreshold
  }

  /**
   * Checks if the salary is higher than the maximum base for social insurance.
   *
   * @param salary
   */
  private hitsMaxSocialBase(salary: number): boolean {
    const { maxBase } = this.socialRates

    return salary >= maxBase
  }
}
