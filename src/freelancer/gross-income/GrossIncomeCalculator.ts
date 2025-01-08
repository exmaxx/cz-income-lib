import { Rates } from '../types'
import { areTechnicallyEqual } from '../../utils'
import { ThresholdKey, Thresholds } from '../enums'
import GrossIncomeCalculatorWithThresholds from '../gross-income-with-thresholds/GrossIncomeCalculatorWithThresholds'
import NetIncomeCalculator from '../net-income/NetIncomeCalculator'
import { ExpensesWrapper } from '../expenses/types'

class GrossIncomeCalculator {
  private readonly minDeductions: number
  private readonly grossWithRulesCalculator: GrossIncomeCalculatorWithThresholds
  private readonly netCalculator: NetIncomeCalculator

  /**
   * @param rates - The rates for income tax, social insurance, and health insurance
   */
  constructor(rates: Rates) {
    this.minDeductions =
      rates.healthRates.minBase * rates.healthRates.rate +
      rates.socialRates.minBase * rates.socialRates.rate

    this.grossWithRulesCalculator = new GrossIncomeCalculatorWithThresholds(rates)
    this.netCalculator = new NetIncomeCalculator(rates)
  }

  /**
   * Calculates the gross income from the net income, expenses, and applicable rates doing multiple
   * rounds of calculations if necessary.
   *
   * # Multiple rounds of calculations
   *
   * The calculation of the gross income from the net income is not automatically reversible because within
   * the net income calculation there are several thresholds that can be reached:
   * - minimal health insurance base
   * - minimal social insurance base
   * - zero income tax
   *
   * The thresholds can be applied to different numbers making the result the same and the original number
   * impossible to determine:
   *
   * > E.g. zero income tax can be reached with 15000 CZK profit, as well as 20000 CZK (because we subtract
   * > 30840 CZK credit). So we have 0 tax but do not know the original profit.
   *
   * Therefore, we try the gross income calculation with different thresholds taken into account and verify
   * if the result is the same as the original net income.
   *
   * The order of the thresholds is clear because of their values. The minimal health insurance base is the highest,
   * then the minimal social insurance base, and then the zero income tax.
   *
   * # Rounding
   *
   * For the calculation to work, the rounding must be disabled. Otherwise, the verification
   * checks would fail. Especially the rounding to hundreds in social were causing the issues.
   *
   * @param netIncome - The income after taxes and insurance contributions
   * @param expensesWrapper - Either a fixed amount or a flat-rate percentage
   * @returns The gross income, which is always zero or positive.
   */
  calculate(netIncome: number, expensesWrapper: ExpensesWrapper): number {
    const isValid = !this.isNetIncomeValid(netIncome)

    if (isValid) {
      return expensesWrapper.getRealExpenses()
    }

    const thresholdSets = this.getThresholdSets()

    return this.calculateWithThresholdSets(netIncome, expensesWrapper, thresholdSets)
  }

  /**
   * Returns the possible threshold sets.
   */
  private getThresholdSets(): ThresholdKey[][] {
    const { MIN_BASE_HEALTH, MIN_BASE_SOCIAL, ZERO_TAX, MAX_FLAT_RATE, MAX_BASE_SOCIAL, HIGH_TAX } =
      Thresholds

    return [
      [],
      [MIN_BASE_HEALTH],
      [MIN_BASE_HEALTH, MIN_BASE_SOCIAL],
      [MIN_BASE_HEALTH, MIN_BASE_SOCIAL, ZERO_TAX],
      [MAX_FLAT_RATE],
      [MAX_BASE_SOCIAL],
      [HIGH_TAX],
      [MAX_BASE_SOCIAL, HIGH_TAX],
      [MAX_FLAT_RATE, HIGH_TAX],
      [MAX_BASE_SOCIAL, HIGH_TAX, MAX_FLAT_RATE],
    ]
  }

  /**
   * Calculates the gross income by trying all possible threshold sets.
   *
   * @param netIncome
   * @param expensesWrapper
   * @param thresholdSets
   * @throws Error - All possible variants of gross income calculation should be covered.
   *   If no gross income returned, it is an error.
   */
  private calculateWithThresholdSets(
    netIncome: number,
    expensesWrapper: ExpensesWrapper,
    thresholdSets: ThresholdKey[][]
  ) {
    for (const thresholds of thresholdSets) {
      const grossIncome = this.calculateWithThresholdSet(netIncome, expensesWrapper, thresholds)

      if (grossIncome !== null) {
        return grossIncome
      }
    }

    throw new Error('Unable to calculate gross income: all approximations failed')
  }

  /**
   * Tries to calculate the gross income with the given thresholds.
   *
   * @param netIncome
   * @param expensesWrapper
   * @param thresholds
   * @private
   */
  private calculateWithThresholdSet(
    netIncome: number,
    expensesWrapper: ExpensesWrapper,
    thresholds: ThresholdKey[]
  ) {
    const grossIncome = this.grossWithRulesCalculator.calculate(
      netIncome,
      expensesWrapper,
      thresholds
    )

    if (this.isGrossIncomeCorrect(grossIncome, netIncome, expensesWrapper)) {
      return grossIncome
    }

    return null
  }

  /**
   * Checks whether net income is large enough to cover the minimal health and social insurance.
   *
   * The smallest possible net income is -minDeductions. This is the case when the gross income is zero,
   * and you have to pay the minimal health and social insurance. Anything below this is not possible.
   *
   * @param netIncome
   * @private
   */
  private isNetIncomeValid(netIncome: number) {
    return netIncome >= -this.minDeductions
  }

  /**
   * Checks if the net income calculated from the gross income is the same as the original net income.
   *
   * @param grossIncome
   * @param netIncome
   * @param expensesWrapper
   */
  private isGrossIncomeCorrect(
    grossIncome: number,
    netIncome: number,
    expensesWrapper: ExpensesWrapper
  ): boolean {
    const { netIncome: netIncomeForVerification } = this.netCalculator.calculate(
      grossIncome,
      expensesWrapper,
      {
        isRoundingEnabled: false,
      }
    )

    return areTechnicallyEqual(netIncomeForVerification, netIncome)
  }
}

export default GrossIncomeCalculator
