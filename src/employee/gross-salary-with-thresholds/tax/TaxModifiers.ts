import { Rates } from '../../types'
import { ThresholdKey, Thresholds } from '../../enums'
import { ModifiersGetter } from '../types'
import { Modifiers } from '../../../types'

export class TaxModifiers implements ModifiersGetter {
  constructor(private readonly rates: Rates) {}

  get(thresholds: ThresholdKey[]): Modifiers {
    const { ZERO_TAX, HIGH_TAX } = Thresholds
    const { credit, highRate, highRateThreshold, rate } = this.rates.incomeRates

    if (thresholds.includes(ZERO_TAX)) {
      return {
        amount: 0,
        rate: 0,
      }
    }

    if (thresholds.includes(HIGH_TAX)) {
      return {
        amount: highRateThreshold * (highRate - rate) + credit,
        rate: highRate,
      }
    }

    return {
      amount: credit,
      rate,
    }
  }
}
