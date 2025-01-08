import { ProfitCoefficientsGetter } from '../../expenses/types'
import { ThresholdKey, Thresholds } from '../../enums'
import { SocialInsuranceRates } from '../../types'
import { ModifiersGetter } from '../types'
import { Modifiers } from '../../../types'

export class SocialModifiers implements ModifiersGetter {
  constructor(private readonly socialRates: SocialInsuranceRates) {}

  get(profitGetter: ProfitCoefficientsGetter, thresholds: ThresholdKey[]): Modifiers {
    const { MAX_BASE_SOCIAL, MIN_BASE_SOCIAL } = Thresholds

    if (thresholds.includes(MIN_BASE_SOCIAL)) {
      return this.getMinSocialModifiers()
    }

    if (thresholds.includes(MAX_BASE_SOCIAL)) {
      return this.getMaxSocialModifiers()
    }

    const profit = profitGetter.getProfitModifiers(thresholds)

    return this.getDefaultSocialModifiers(profit)
  }

  private getDefaultSocialModifiers(profit: Modifiers): Modifiers {
    const { basePercentage, rate } = this.socialRates

    return {
      amount: profit.amount * basePercentage * rate,
      rate: profit.rate * basePercentage * rate,
    }
  }

  private getMaxSocialModifiers(): Modifiers {
    const { maxBase, rate } = this.socialRates

    return {
      amount: maxBase * rate,
      rate: 0,
    }
  }

  private getMinSocialModifiers(): Modifiers {
    const { minBase, rate } = this.socialRates

    return {
      amount: minBase * rate,
      rate: 0,
    }
  }
}
