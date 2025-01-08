import { IncomeRates, NetIncomeCalculationOptions } from '../../types'
import { maybeToCeil } from '../../../utils'

export default class TaxCalculator {
  constructor(private readonly incomeRates: IncomeRates) {}

  /**
   * Calculate the income tax. Apply high rate tax if necessary.
   *
   * @param salary - Yearly salary
   * @param options - Options for the calculation
   */
  calculate(salary: number, { isRoundingEnabled }: NetIncomeCalculationOptions = { isRoundingEnabled: true }) {
    const { credit } = this.incomeRates

    let incomeTaxNormalRate = maybeToCeil(this.getNormalRateTax(salary), isRoundingEnabled)
    let incomeTaxHighRate = maybeToCeil(this.getHighRateTax(salary), isRoundingEnabled)

    const incomeTax = Math.max(incomeTaxNormalRate + incomeTaxHighRate - credit, 0)

    return { incomeTaxNormalRate, incomeTaxHighRate, incomeTax }
  }

  /**
   * Calculate the normal rate tax.
   *
   * Normal rate is applied to salary up to the high rate threshold.
   *
   * @param salary
   */
  getNormalRateTax(salary: number) {
    const { highRateThreshold, rate } = this.incomeRates

    const salaryCapped = Math.min(salary, highRateThreshold)

    return salaryCapped * rate
  }

  /**
   * Calculate the high rate tax.
   *
   * High rate is applied to salary above the high rate threshold.
   *
   * @param salary
   */
  getHighRateTax(salary: number) {
    const { highRateThreshold, highRate } = this.incomeRates

    const salaryAboveThreshold = Math.max(salary - highRateThreshold, 0)

    return salaryAboveThreshold * highRate
  }
}
