import { SocialInsuranceRates } from '../../types'
import { NetIncomeCalculationOptions } from '../types'
import { NetIncomeSocialResults } from './types'

export class SocialCalculator {
  constructor(private readonly _socialRates: SocialInsuranceRates) {}

  /**
   * Calculates the social insurance contributions based on the income tax base and the social rates.
   */
  calc(
    incomeTaxBase: number,
    { isRoundingEnabled }: NetIncomeCalculationOptions
  ): NetIncomeSocialResults {
    const socialAssessmentBase = this.calculateSocialAssessmentBase(
      incomeTaxBase,
      this._socialRates
    )

    const social = socialAssessmentBase * this._socialRates.rate

    return {
      social: isRoundingEnabled ? Math.ceil(social) : social,
      socialAssessmentBase,
    }
  }

  private calculateSocialAssessmentBase(
    incomeTaxBase: number,
    { basePercentage, maxBase, minBase }: SocialInsuranceRates
  ) {
    let socialAssessmentBase = incomeTaxBase * basePercentage

    if (socialAssessmentBase < minBase) {
      socialAssessmentBase = minBase
    }

    if (socialAssessmentBase > maxBase) {
      socialAssessmentBase = maxBase
    }

    return socialAssessmentBase
  }
}
