import { TaxGetter } from './types'
import { ProfitCoefficientsGetter } from '../../expenses/types'
import { ThresholdKey } from '../../enums'
import { CalculationModifiers, IncomeRates } from '../../types'

export class NormalRateTaxCalculator implements TaxGetter {
  constructor(private readonly incomeRates: IncomeRates) {}

  calculate(
    expensesWrapper: ProfitCoefficientsGetter,
    thresholds: ThresholdKey[]
  ): CalculationModifiers {
    const { credit, nonTaxable, rate } = this.incomeRates

    const profit = expensesWrapper.getProfitModifiers(thresholds)

    return {
      grossIncomeAdjustment: profit.grossIncomeAdjustment * rate - nonTaxable * rate - credit,
      grossIncomeMultiplier: profit.grossIncomeMultiplier * rate,
    }
  }
}
