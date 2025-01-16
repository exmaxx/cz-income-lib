import { ModifiersGetter } from '../types'
import { ProfitCoefficientsGetter } from '../../expenses/types'
import { ThresholdKey } from '../../enums'
import { IncomeRates } from '../../types'
import { Modifiers } from '../../../types'

export class NormalRateTaxModifiers implements ModifiersGetter {
  constructor(private readonly incomeRates: IncomeRates) {}

  get(expensesWrapper: ProfitCoefficientsGetter, thresholds: ThresholdKey[]): Modifiers {
    const { credit, nonTaxable, rate } = this.incomeRates

    const profit = expensesWrapper.getProfitModifiers(thresholds)

    return {
      amount: profit.amount * rate - nonTaxable * rate - credit,
      rate: profit.rate * rate,
    }
  }
}
