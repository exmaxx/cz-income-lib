import { NetIncomeCalculationOptions, SocialInsuranceRates } from '../../types'
import { maybeToCeil } from '../../../utils'

export default class SocialCalculator {
  constructor(private readonly socialRates: SocialInsuranceRates) {}

  /**
   * Calculate the social insurance contributions.
   *
   * Important: When the salary is higher than the maximum base, the rate is 0.
   *
   * @param salary
   * @param options
   */
  calculate(salary: number, { isRoundingEnabled }: NetIncomeCalculationOptions) {
    const { maxBase, employeeRate, employerRate } = this.socialRates

    const base = Math.min(salary, maxBase)

    const socialEmployee = base * employeeRate
    const socialEmployer = salary * employerRate

    return {
      employee: maybeToCeil(socialEmployee, isRoundingEnabled),
      employer: maybeToCeil(socialEmployer, isRoundingEnabled),
    }
  }
}
