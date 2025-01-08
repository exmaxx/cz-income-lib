import { Rates } from '../../types'
import NetSalaryCalculator from '../../net-salary/NetSalaryCalculator'
import { AVG_SALARY_MONTHLY } from '../../constants'
import { areTechnicallyEqual } from '../../../utils'

export class NetSalaryChecker {
  constructor(
    private readonly netSalary: number,
    private readonly rates: Rates
  ) {}

  /**
   * Checks the minimum net salary.
   *
   * A net salary below the minimum health amount would result in a negative gross salary, which is not possible.
   */
  isSalaryBelowMin() {
    return this.netSalary < -this.rates.healthRates.minAmount
  }

  isBelowAverage() {
    return this.netSalary < AVG_SALARY_MONTHLY * 12
  }

  isCalculableFromGrossSalary(grossSalary: number, netSalaryCalculator: NetSalaryCalculator): boolean {
    const { netSalary: netSalaryForVerification } = netSalaryCalculator.calculate(grossSalary, {
      isRoundingEnabled: false,
    })

    return areTechnicallyEqual(netSalaryForVerification, this.netSalary)
  }
}
