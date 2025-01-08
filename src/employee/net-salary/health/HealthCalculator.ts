import { HealthInsuranceRates, NetIncomeCalculationOptions } from '../../types'
import { maybeToCeil } from '../../../utils'

export default class HealthCalculator {
  constructor(private readonly healthRates: HealthInsuranceRates) {}

  /**
   * Calculate the health insurance contributions.
   *
   * Important: When the health insurance contributions are less than the minimum amount,
   * the employee pays the difference.
   *
   * @param salary
   * @param options
   */
  calculate(salary: number, { isRoundingEnabled }: NetIncomeCalculationOptions) {
    const { minAmount, employeeRate, employerRate } = this.healthRates

    const employeeHealth = salary * employeeRate
    const employerHealth = salary * employerRate

    const healthTotal = employeeHealth + employerHealth

    if (healthTotal < minAmount) {
      return {
        employee: maybeToCeil(minAmount - employerHealth, isRoundingEnabled),
        employer: maybeToCeil(employerHealth, isRoundingEnabled),
      }
    }

    return {
      employee: maybeToCeil(employeeHealth, isRoundingEnabled),
      employer: maybeToCeil(employerHealth, isRoundingEnabled),
    }
  }
}
