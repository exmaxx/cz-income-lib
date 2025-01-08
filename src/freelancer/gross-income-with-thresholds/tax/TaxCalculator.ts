import { ProfitCoefficientsGetter } from '../../expenses/types'
import { ThresholdKey, Thresholds } from '../../enums'
import { CalculationModifiers, IncomeRates } from '../../types'
import { ZeroTaxCalculator } from './ZeroTaxCalculator'
import { HighRateTaxCalculator } from './HighRateTaxCalculator'
import { NormalRateTaxCalculator } from './NormalRateTaxCalculator'
import { TaxGetter } from './types'

export class TaxCalculator implements TaxGetter {
  constructor(private readonly incomeRates: IncomeRates) {}

  calculate(expensesWrapper: ProfitCoefficientsGetter, thresholds: ThresholdKey[]): CalculationModifiers {
    const { HIGH_TAX, ZERO_TAX } = Thresholds

    if (thresholds.includes(ZERO_TAX)) {
      return new ZeroTaxCalculator().calculate()
    }

    if (thresholds.includes(HIGH_TAX)) {
      return new HighRateTaxCalculator(this.incomeRates).calculate(expensesWrapper, thresholds)
    }

    return new NormalRateTaxCalculator(this.incomeRates).calculate(expensesWrapper, thresholds)
  }
}
