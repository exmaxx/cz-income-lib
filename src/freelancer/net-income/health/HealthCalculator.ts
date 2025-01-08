import { HealthInsuranceRates } from '../../types'
import { NetIncomeCalculationOptions } from '../types'
import { NetIncomeHealthResults } from './types'

export class HealthCalculator {
  constructor(private readonly _healthRates: HealthInsuranceRates) {}

  /**
   * Calculates the health insurance contributions based on the income tax base and the health rates.
   */
  calc(
    incomeTaxBase: number,
    { isRoundingEnabled }: NetIncomeCalculationOptions
  ): NetIncomeHealthResults {
    const healthAssessmentBase = this.calculateHealthAssessmentBase(
      incomeTaxBase,
      this._healthRates
    )

    const health = healthAssessmentBase * this._healthRates.rate

    return {
      healthAssessmentBase,
      health: isRoundingEnabled ? Math.ceil(health) : health,
    }
  }

  private calculateHealthAssessmentBase(
    incomeTaxBase: number,
    { basePercentage, minBase }: HealthInsuranceRates
  ) {
    return Math.max(incomeTaxBase * basePercentage, minBase)
  }
}
