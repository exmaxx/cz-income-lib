import { Rates } from '../../types'
import { ThresholdKey, Thresholds } from '../../enums'
import { ModifiersGetter } from '../types'
import { Modifiers } from '../../../types'

export class HealthModifiers implements ModifiersGetter {
  private rates: Rates

  constructor(rates: Rates) {
    this.rates = rates
  }

  get(thresholds: ThresholdKey[]): Modifiers {
    const { MIN_HEALTH } = Thresholds
    const { employeeRate, employerRate, minAmount } = this.rates.healthRates

    if (thresholds.includes(MIN_HEALTH)) {
      return {
        amount: minAmount,
        rate: -employerRate,
      }
    }

    return {
      amount: 0,
      rate: employeeRate,
    }
  }
}
