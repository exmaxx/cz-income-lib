import { ProfitCoefficientsGetter } from '../../expenses/types'
import { ThresholdKey, Thresholds } from '../../enums'
import { IncomeRates } from '../../types'
import { ZeroTaxModifiers } from './ZeroTaxModifiers'
import { HighRateTaxModifiers } from './HighRateTaxModifiers'
import { NormalRateTaxModifiers } from './NormalRateTaxModifiers'
import { ModifiersGetter } from '../types'
import { Modifiers } from '../../../types'

export class TaxModifiers implements ModifiersGetter {
  constructor(private readonly incomeRates: IncomeRates) {}

  get(expensesWrapper: ProfitCoefficientsGetter, thresholds: ThresholdKey[]): Modifiers {
    const { HIGH_TAX, ZERO_TAX } = Thresholds

    if (thresholds.includes(ZERO_TAX)) {
      return new ZeroTaxModifiers().get()
    }

    if (thresholds.includes(HIGH_TAX)) {
      return new HighRateTaxModifiers(this.incomeRates).get(expensesWrapper, thresholds)
    }

    return new NormalRateTaxModifiers(this.incomeRates).get(expensesWrapper, thresholds)
  }
}
