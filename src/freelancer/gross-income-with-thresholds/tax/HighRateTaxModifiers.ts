import { ModifiersGetter } from '../types'
import { IncomeRates } from '../../types'
import { ProfitCoefficientsGetter } from '../../expenses/types'
import { ThresholdKey } from '../../enums'
import { Modifiers } from '../../../types'

export class HighRateTaxModifiers implements ModifiersGetter {
  constructor(private readonly incomeRates: IncomeRates) {}

  get(expensesWrapper: ProfitCoefficientsGetter, thresholds: ThresholdKey[]): Modifiers {
    const { credit } = this.incomeRates

    const profit = expensesWrapper.getProfitModifiers(thresholds)

    const highTax = this.getHighTaxModifiers(profit)
    const lowTax = this.getLowTaxModifiers()

    return {
      amount: highTax.amount + lowTax.amount - credit,
      rate: highTax.rate + lowTax.rate,
    }
  }

  private getLowTaxModifiers(): Modifiers {
    const { highRateThreshold, rate } = this.incomeRates

    return {
      amount: highRateThreshold * rate,
      rate: 0,
    }
  }

  private getHighTaxModifiers(profit: Modifiers): Modifiers {
    const { highRate, highRateThreshold, nonTaxable } = this.incomeRates

    const highTaxAmount = profit.amount - nonTaxable - highRateThreshold

    return {
      amount: highTaxAmount * highRate,
      rate: profit.rate * highRate,
    }
  }
}
