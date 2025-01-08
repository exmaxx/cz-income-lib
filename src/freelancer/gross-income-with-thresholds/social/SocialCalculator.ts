import { ProfitCoefficientsGetter } from '../../expenses/types'
import { ThresholdKey, Thresholds } from '../../enums'
import { CalculationModifiers, SocialInsuranceRates } from '../../types'

export class SocialCalculator {
  constructor(private readonly socialRates: SocialInsuranceRates) {}

  calculate(expensesWrapper: ProfitCoefficientsGetter, thresholds: ThresholdKey[]): CalculationModifiers {
    const { MAX_BASE_SOCIAL, MIN_BASE_SOCIAL } = Thresholds

    if (thresholds.includes(MIN_BASE_SOCIAL)) {
      return this.getMinSocialModifiers()
    }

    if (thresholds.includes(MAX_BASE_SOCIAL)) {
      return this.getMaxSocialModifiers()
    }

    const profit = expensesWrapper.getProfitModifiers(thresholds)

    return this.getDefaultSocialModifiers(profit)
  }

  private getDefaultSocialModifiers(profit: CalculationModifiers): CalculationModifiers {
    const { basePercentage, rate } = this.socialRates

    return {
      grossIncomeAdjustment: profit.grossIncomeAdjustment * basePercentage * rate,
      grossIncomeMultiplier: profit.grossIncomeMultiplier * basePercentage * rate,
    }
  }

  private getMaxSocialModifiers(): CalculationModifiers {
    const { maxBase, rate } = this.socialRates

    return {
      grossIncomeAdjustment: maxBase * rate,
      grossIncomeMultiplier: 0,
    }
  }

  private getMinSocialModifiers(): CalculationModifiers {
    const { minBase, rate } = this.socialRates

    return {
      grossIncomeAdjustment: minBase * rate,
      grossIncomeMultiplier: 0,
    }
  }
}
