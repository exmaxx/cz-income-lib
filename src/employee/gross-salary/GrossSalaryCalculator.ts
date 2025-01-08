import { Rates } from '../types'
import NetSalaryCalculator from '../net-salary/NetSalaryCalculator'
import GrossSalaryCalculatorWithRules from '../gross-salary-with-thresholds/GrossSalaryWithThresholds'
import { ThresholdsChecker } from './checkers/ThresholdsChecker'
import { NetSalaryChecker } from './checkers/NetSalaryChecker'

export default class GrossSalaryCalculator {
  constructor(
    private readonly rates: Rates,
    private readonly netSalaryCalculator: NetSalaryCalculator,
    private readonly grossSalaryCalculatorWithRules: GrossSalaryCalculatorWithRules
  ) {}

  static create(rates: Rates) {
    return new GrossSalaryCalculator(
      rates,
      NetSalaryCalculator.create(rates),
      GrossSalaryCalculatorWithRules.create(rates)
    )
  }

  public calculate(netSalary: number): number {
    const netSalaryChecker = new NetSalaryChecker(netSalary, this.rates)

    if (netSalaryChecker.isSalaryBelowMin()) {
      return 0
    }

    const thresholdSets = netSalaryChecker.isBelowAverage()
      ? ThresholdsChecker.getLowSalaryThresholdSets()
      : ThresholdsChecker.getHighSalaryThresholdSets()

    for (const thresholds of thresholdSets) {
      const grossSalary = this.grossSalaryCalculatorWithRules.calculate(netSalary, thresholds)

      if (netSalaryChecker.isCalculableFromGrossSalary(grossSalary, this.netSalaryCalculator)) {
        return grossSalary
      }
    }

    throw new Error('Unable to calculate gross salary')
  }
}
