import { NetIncomeCalculationOptions, Rates } from '../types'
import { NetSalaryResults } from './types'
import SocialCalculator from './social/SocialCalculator'
import HealthCalculator from './health/HealthCalculator'
import TaxCalculator from './tax/TaxCalculator'

export default class NetSalaryCalculator {
  constructor(
    private readonly socialCalculator: SocialCalculator,
    private readonly healthCalculator: HealthCalculator,
    private readonly taxCalculator: TaxCalculator
  ) {}

  static create(rates: Rates) {
    const { incomeRates, socialRates, healthRates } = rates

    const socialCalculator = new SocialCalculator(socialRates)
    const healthCalculator = new HealthCalculator(healthRates)
    const taxCalculator = new TaxCalculator(incomeRates)

    return new NetSalaryCalculator(socialCalculator, healthCalculator, taxCalculator)
  }

  /**
   * Calculate the net income for an employee based on their salary and the tax rates.
   *
   * @param salary - Yearly salary
   * @param options - Options for the calculation
   */
  calculate(salary: number, options: NetIncomeCalculationOptions = { isRoundingEnabled: true }): NetSalaryResults {
    const { incomeTaxNormalRate, incomeTaxHighRate, incomeTax } = this.taxCalculator.calculate(salary, options)

    const social = this.socialCalculator.calculate(salary, options)

    const health = this.healthCalculator.calculate(salary, options)

    const netSalary = salary - incomeTax - social.employee - health.employee

    return {
      incomeTax,
      incomeTaxNormalRate,
      incomeTaxHighRate,
      social,
      health,
      netSalary,
    }
  }
}
