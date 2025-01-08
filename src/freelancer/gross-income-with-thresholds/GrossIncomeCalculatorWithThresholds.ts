import { HealthInsuranceRates, IncomeRates, Rates, SocialInsuranceRates } from '../types'
import { ThresholdKey } from '../enums'
import { ExpensesWrapperForGrossIncome } from '../expenses/types'
import { SocialModifiers } from './social/SocialModifiers'
import { HealthModifiers } from './health/HealthModifiers'
import { TaxModifiers } from './tax/TaxModifiers'
import ProfitModifiers from './profit/ProfitModifiers'

export default class GrossIncomeCalculatorWithThresholds {
  private readonly incomeRates: IncomeRates
  private readonly socialRates: SocialInsuranceRates
  private readonly healthRates: HealthInsuranceRates

  constructor(private readonly rates: Rates) {
    this.incomeRates = this.rates.incomeRates
    this.socialRates = this.rates.socialRates
    this.healthRates = this.rates.healthRates
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
    expensesWrapper: ExpensesWrapperForGrossIncome,
    thresholds: ThresholdKey[] = []
  ): number {
    const tax = new TaxModifiers(this.incomeRates).get(expensesWrapper, thresholds)
    const profit = new ProfitModifiers().get(expensesWrapper)
    const social = new SocialModifiers(this.socialRates).get(expensesWrapper, thresholds)
    const health = new HealthModifiers(this.healthRates).get(expensesWrapper, thresholds)

    const adjustedNetIncome = netIncome - (profit.amount - tax.amount - social.amount - health.amount)

    const combinedRates = profit.rate - tax.rate - social.rate - health.rate

    return adjustedNetIncome / combinedRates
  }
}
