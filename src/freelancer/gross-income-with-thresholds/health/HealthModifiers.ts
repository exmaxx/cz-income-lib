import { ProfitCoefficientsGetter } from '../../expenses/types'
import { ThresholdKey, Thresholds } from '../../enums'
import { HealthInsuranceRates } from '../../types'
import { ModifiersGetter } from '../types'
import { Modifiers } from '../../../types'

export class HealthModifiers implements ModifiersGetter {
  constructor(private readonly healthRates: HealthInsuranceRates) {}

  get(profitGetter: ProfitCoefficientsGetter, thresholds: ThresholdKey[]): Modifiers {
    const { MIN_BASE_HEALTH } = Thresholds

    if (thresholds.includes(MIN_BASE_HEALTH)) {
      return this.getMinHealthModifiers()
    }

    const profit = profitGetter.getProfitModifiers(thresholds)

    return this.getDefaultHealthModifiers(profit)
  }

  private getDefaultHealthModifiers(profit: Modifiers): Modifiers {
    const { basePercentage, rate } = this.healthRates

    return {
      amount: profit.amount * basePercentage * rate,
      rate: profit.rate * basePercentage * rate,
    }
  }

  private getMinHealthModifiers(): Modifiers {
    const { minBase, rate } = this.healthRates

    return {
      amount: minBase * rate,
      rate: 0,
    }
  }
}
