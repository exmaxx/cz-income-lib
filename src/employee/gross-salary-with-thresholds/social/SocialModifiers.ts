import { Rates } from '../../types'
import { ThresholdKey, Thresholds } from '../../enums'
import { ModifiersGetter } from '../types'
import { Modifiers } from '../../../types'

export class SocialModifiers implements ModifiersGetter {
  private rates: Rates

  constructor(rates: Rates) {
    this.rates = rates
  }

  get(thresholds: ThresholdKey[]): Modifiers {
    const { MAX_BASE_SOCIAL } = Thresholds
    const { maxBase, employeeRate } = this.rates.socialRates

    if (thresholds.includes(MAX_BASE_SOCIAL)) {
      return {
        amount: maxBase * employeeRate,
        rate: 0,
      }
    }

    return {
      amount: 0,
      rate: employeeRate,
    }
  }
}
