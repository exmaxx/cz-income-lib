import { ProfitCoefficientsGetter } from '../../expenses/types'
import { ThresholdKey, Thresholds } from '../../enums'
import { CalculationModifiers, HealthInsuranceRates } from '../../types'

export class HealthCalculator {
  constructor(private readonly healthRates: HealthInsuranceRates) {}

  calculate(expensesWrapper: ProfitCoefficientsGetter, thresholds: ThresholdKey[]): CalculationModifiers {
    const { MIN_BASE_HEALTH } = Thresholds

    if (thresholds.includes(MIN_BASE_HEALTH)) {
      return this.getMinHealthModifiers()
    }

    const profit = expensesWrapper.getProfitModifiers(thresholds)

    return this.getDefaultHealthModifiers(profit)
  }

  private getDefaultHealthModifiers(profit: CalculationModifiers): CalculationModifiers {
    const { basePercentage, rate } = this.healthRates

    return {
      grossIncomeAdjustment: profit.grossIncomeAdjustment * basePercentage * rate,
      grossIncomeMultiplier: profit.grossIncomeMultiplier * basePercentage * rate,
    }
  }

  private getMinHealthModifiers(): CalculationModifiers {
    const { minBase, rate } = this.healthRates

    return {
      grossIncomeAdjustment: minBase * rate,
      grossIncomeMultiplier: 0,
    }
  }
}
