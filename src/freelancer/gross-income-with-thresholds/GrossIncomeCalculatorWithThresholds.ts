import {
  CalculationModifiers,
  HealthInsuranceRates,
  IncomeRates,
  Rates,
  SocialInsuranceRates,
} from '../types'
import { ThresholdKey } from '../enums'
import { RealExpensesGetter, ProfitCoefficientsGetter } from '../expenses/types'
import { SocialCalculator } from './social/SocialCalculator'
import { HealthCalculator } from './health/HealthCalculator'
import { TaxCalculator } from './tax/TaxCalculator'

export default class GrossIncomeCalculatorWithThresholds {
  private readonly incomeRates: IncomeRates
  private readonly socialRates: SocialInsuranceRates
  private readonly healthRates: HealthInsuranceRates

  /**
   * @param rates - The rates for income tax, social insurance, and health insurance
   */
  constructor(private readonly rates: Rates) {
    this.incomeRates = this.rates.incomeRates
    this.socialRates = this.rates.socialRates
    this.healthRates = this.rates.healthRates
  }

  /**
   * Calculates the real profit from the expenses. In case of flat-rate percentage expenses, the real profit
   * is the whole gross income.
   *
   * @param expensesWrapper
   */
  getRealProfit(expensesWrapper: RealExpensesGetter): CalculationModifiers {
    let grossIncomeAdjustment = -expensesWrapper.getRealExpenses()
    let grossIncomeMultiplier = 1

    return {
      grossIncomeAdjustment,
      grossIncomeMultiplier,
    }
  }

  /**
   * Calculates the gross income from the net income, expenses, and applicable rates. However,
   * the calculation might be off from the real gross income when proper thresholds rules are not applied.
   *
   * # Expense types
   *
   * The formula differs slightly based on the type of expenses:
   *  - flat-rate percentage (e.g. 60%)
   *  - or real amount (e.g. 500000 CZK)
   *
   * # Threshold rules
   *
   * The calculation takes into account that the net income might have been calculated reaching:
   *  - minimal health insurance base
   *  - minimal social insurance base
   *  - zero income tax
   *
   * This happens when the profit was too low (either original gross income was too low or the expenses were too high).
   *
   * ## How to use the rules
   *
   * The developer must decide which rules to use based on the original net income calculation.
   *
   * You can verify the rules by running the net income calculation after this method. When you see that
   * the result returned e.g. the minimal health insurance base, you should use the `isMinHealthBaseUsed` rule.
   *
   * @param netIncome - The income after taxes and insurance contributions
   * @param expensesWrapper - Either a fixed amount or a flat-rate percentage
   * @param thresholds - The thresholds to use in the calculation
   *
   * @returns The gross income
   */
  calculate(
    netIncome: number,
    expensesWrapper: RealExpensesGetter & ProfitCoefficientsGetter,
    thresholds: ThresholdKey[] = []
  ): number {
    const taxCalculator = new TaxCalculator(this.incomeRates)
    const tax = taxCalculator.calculate(expensesWrapper, thresholds)

    const profit = this.getRealProfit(expensesWrapper)

    const socialCalculator = new SocialCalculator(this.socialRates)
    const social = socialCalculator.calculate(expensesWrapper, thresholds)

    const healthCalculator = new HealthCalculator(this.healthRates)
    const health = healthCalculator.calculate(expensesWrapper, thresholds)

    const fractionTop =
      netIncome -
      (profit.grossIncomeAdjustment -
        tax.grossIncomeAdjustment -
        social.grossIncomeAdjustment -
        health.grossIncomeAdjustment)

    const fractionBottom =
      profit.grossIncomeMultiplier -
      tax.grossIncomeMultiplier -
      social.grossIncomeMultiplier -
      health.grossIncomeMultiplier

    return fractionTop / fractionBottom
  }
}
