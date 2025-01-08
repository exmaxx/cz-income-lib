import {
  Expenses,
  HealthInsuranceRates,
  IncomeRates,
  Rates,
  SocialInsuranceRates,
} from '../../types'
import { ThresholdKey, Thresholds } from '../../enums'
import { MAX_FLAT_RATE_INCOME } from '../../constants'

import { NetIncomeResults } from '../types'

export class ThresholdsChecker {
  private readonly incomeRates: IncomeRates
  private readonly socialRates: SocialInsuranceRates
  private readonly healthRates: HealthInsuranceRates

  constructor(rates: Rates) {
    this.incomeRates = rates.incomeRates
    this.socialRates = rates.socialRates
    this.healthRates = rates.healthRates
  }

  /**
   * Checks the calculation thresholds that might have been reached.
   *
   * @param grossIncome
   * @param expenses
   * @param netIncomeResults
   */
  check(
    grossIncome: number,
    netIncomeResults: NetIncomeResults,
    expenses: Expenses
  ): Set<ThresholdKey> {
    const {
      HIGH_TAX,
      MAX_BASE_SOCIAL,
      MAX_FLAT_RATE,
      MIN_BASE_HEALTH,
      MIN_BASE_SOCIAL,
      ZERO_TAX,
      ZERO_TAX_BASE,
    } = Thresholds

    const reachedThresholds = new Set<ThresholdKey>()

    const { highRateTaxBase, incomeTax, incomeTaxBase, profit } = netIncomeResults

    if (expenses.percentage) {
      if (this.hitsMaxFlatRate(grossIncome, expenses.percentage)) {
        reachedThresholds.add(MAX_FLAT_RATE)
      }
    }

    if (this.hitsZeroTaxBase(profit)) {
      reachedThresholds.add(ZERO_TAX_BASE)
    }

    if (this.hitsZeroTax(incomeTax)) {
      reachedThresholds.add(ZERO_TAX)
    }

    if (this.hitsHighTax(highRateTaxBase)) {
      reachedThresholds.add(HIGH_TAX)
    }

    if (this.hitsMinBaseSocial(incomeTaxBase)) {
      reachedThresholds.add(MIN_BASE_SOCIAL)
    }

    if (this.hitsMaxBaseSocial(incomeTaxBase)) {
      reachedThresholds.add(MAX_BASE_SOCIAL)
    }

    if (this.hitsMinBaseHealth(incomeTaxBase)) {
      reachedThresholds.add(MIN_BASE_HEALTH)
    }

    return reachedThresholds
  }

  private hitsMaxFlatRate(grossIncome: number, percentage: number): boolean {
    const maxAmount = MAX_FLAT_RATE_INCOME * percentage
    const flatRateAmount = grossIncome * percentage

    return flatRateAmount >= maxAmount
  }

  private hitsZeroTaxBase(profit: number): boolean {
    const taxableProfit = profit - this.incomeRates.nonTaxable

    return taxableProfit <= 0
  }

  private hitsHighTax(amountWithHighTax: number): boolean {
    return amountWithHighTax > 0
  }

  private hitsZeroTax(incomeTax: number): boolean {
    return incomeTax <= 0
  }

  private hitsMinBaseSocial(incomeTaxBase: number): boolean {
    const socialAssessmentBase = incomeTaxBase * this.socialRates.basePercentage

    return socialAssessmentBase <= this.socialRates.minBase
  }

  private hitsMaxBaseSocial(incomeTaxBase: number): boolean {
    const socialAssessmentBase = incomeTaxBase * this.socialRates.basePercentage

    return socialAssessmentBase >= this.socialRates.maxBase
  }

  private hitsMinBaseHealth(incomeTaxBase: number): boolean {
    const healthAssessmentBase = incomeTaxBase * this.healthRates.basePercentage

    return healthAssessmentBase <= this.healthRates.minBase
  }
}
