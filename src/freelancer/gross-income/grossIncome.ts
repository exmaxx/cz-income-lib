import calculateGrossIncomeWithRules from './grossIncomeWithRules'
import calculateNetIncome from '../net-income/netIncome'
import { Expenses } from '../types'
import { areTechnicallyEqual } from '../../utils'
import { Rates } from '../rates'

export default class GrossIncomeCalculator {
  #netIncome: number
  #expenses: Expenses
  #rates: Rates

  constructor(netIncome: number, expenses: Expenses, rates: Rates) {
    this.#netIncome = netIncome
    this.#expenses = expenses
    this.#rates = rates
  }

  /**
   * Calculates the gross income from the net income, expenses, and applicable rates doing multiple
   * rounds of calculations if necessary.
   *
   * @returns The gross income, which is always zero or positive.
   */
  calculate(): number {
    if (!this.#areParamsValid()) {
      if (this.#expenses.amount) {
        return this.#expenses.amount
      }

      return 0
    }

    const grossIncome = this.#findVerifiedGrossIncome()

    if (grossIncome === null) {
      throw new Error('Unable to calculate gross income: all approximations failed')
    }

    return grossIncome
  }

  /**
   * Checks if the given setup is valid.
   */
  #areParamsValid(): boolean {
    const { minDeductions } = this.#rates

    // The smallest possible net income is `-minDeductions`. This is the case when the gross income
    // is zero, and you have to pay the minimal health and social insurance. Anything below this is not possible.
    return this.#netIncome >= -minDeductions
  }

  /**
   * Finds the correct gross income by applying different rules for the calculation.
   *
   * ## Multiple rounds of calculations
   *
   * The calculation of the gross income from the net income is not automatically reversible because within
   * the net income calculation there are several thresholds that can be reached:
   * - minimal health insurance base
   * - minimal social insurance base
   * - zero income tax
   * - and more
   *
   * The thresholds can be applied to different numbers making the result the same and the original number
   * impossible to determine:
   *
   * > E.g. zero income tax can be reached with 15000 CZK profit, as well as 20000 CZK (because we subtract
   * > 30840 CZK credit). So we have 0 CZK tax but do not know the original profit.
   *
   * Therefore, we try to find the correct gross income by iterating with different thresholds
   * taken into account. We verify if the result is the same as the original net income.
   */
  #findVerifiedGrossIncome(): number | null {
    const ruleSets = [
      {},
      { isMinHealthBaseUsed: true },
      { isMinHealthBaseUsed: true, isMinSocialBaseUsed: true },
      { isMinHealthBaseUsed: true, isMinSocialBaseUsed: true, isIncomeTaxZero: true },
      { isMaxFlatRateUsed: true },
      { isMaxSocialBaseUsed: true },
      { isHighRateIncomeTaxUsed: true },
      { isMaxSocialBaseUsed: true, isHighRateIncomeTaxUsed: true },
      { isMaxFlatRateUsed: true, isHighRateIncomeTaxUsed: true },
      { isMaxSocialBaseUsed: true, isHighRateIncomeTaxUsed: true, isMaxFlatRateUsed: true },
    ]

    for (const rules of ruleSets) {
      const grossIncomeCandidate = calculateGrossIncomeWithRules(
        this.#netIncome,
        this.#expenses,
        this.#rates,
        rules
      )
      const isVerified = this.#verifyGrossIncome(grossIncomeCandidate)

      if (isVerified) {
        return grossIncomeCandidate
      }
    }
    return null
  }

  #verifyGrossIncome(grossIncomeCandidate: number): boolean {
    const { netIncome: netIncomeCandidate } = calculateNetIncome(
      grossIncomeCandidate,
      this.#expenses,
      this.#rates,
      {
        isRoundingEnabled: false,
      }
    )

    return areTechnicallyEqual(netIncomeCandidate, this.#netIncome)
  }
}

/**
 * Checks if the given setup is valid.
 *
 * @param rates
 * @param netIncome
 */
// function areParamsValid(rates: Rates, netIncome: number): boolean {
//   const { minDeductions } = rates
//
//   // The smallest possible net income is `-minDeductions`. This is the case when the gross income
//   // is zero, and you have to pay the minimal health and social insurance. Anything below this is not possible.
//   return netIncome >= -minDeductions
// }

/**
 * Verifies if the given gross income is correct.
 *
 * ## Rounding
 *
 * For the verification to work, the rounding must be disabled. Otherwise, the verification
 * net income might not be equal to the original net income. The rounding would make multiple
 * possible gross incomes to be correct because we would not know what the number was before the rounding.
 *
 * @param grossIncomeCandidate
 * @param netIncome
 * @param expenses
 * @param rates
 */
// function verifyGrossIncome(
//   grossIncomeCandidate: number,
//   netIncome: number,
//   expenses: Expenses,
//   rates: Rates
// ): boolean {
//   const { netIncome: netIncomeCandidate } = calculateNetIncome(
//     grossIncomeCandidate,
//     expenses,
//     rates,
//     {
//       isRoundingEnabled: false,
//     }
//   )
//
//   return areTechnicallyEqual(netIncomeCandidate, netIncome)
// }

/**
 * Finds the correct gross income by applying different rules for the calculation.
 *
 * ## Multiple rounds of calculations
 *
 * The calculation of the gross income from the net income is not automatically reversible because within
 * the net income calculation there are several thresholds that can be reached:
 * - minimal health insurance base
 * - minimal social insurance base
 * - zero income tax
 * - and more
 *
 * The thresholds can be applied to different numbers making the result the same and the original number
 * impossible to determine:
 *
 * > E.g. zero income tax can be reached with 15000 CZK profit, as well as 20000 CZK (because we subtract
 * > 30840 CZK credit). So we have 0 CZK tax but do not know the original profit.
 *
 * Therefore, we try to find the correct gross income by iterating with different thresholds
 * taken into account. We verify if the result is the same as the original net income.
 *
 * @param netIncome
 * @param expenses
 * @param rates
 */
// function findVerifiedGrossIncome(
//   netIncome: number,
//   expenses: Expenses,
//   rates: Rates
// ): number | null {
//   const ruleSets = [
//     {},
//     { isMinHealthBaseUsed: true },
//     { isMinHealthBaseUsed: true, isMinSocialBaseUsed: true },
//     { isMinHealthBaseUsed: true, isMinSocialBaseUsed: true, isIncomeTaxZero: true },
//     { isMaxFlatRateUsed: true },
//     { isMaxSocialBaseUsed: true },
//     { isHighRateIncomeTaxUsed: true },
//     { isMaxSocialBaseUsed: true, isHighRateIncomeTaxUsed: true },
//     { isMaxFlatRateUsed: true, isHighRateIncomeTaxUsed: true },
//     { isMaxSocialBaseUsed: true, isHighRateIncomeTaxUsed: true, isMaxFlatRateUsed: true },
//   ]
//
//   for (const rules of ruleSets) {
//     const grossIncomeCandidate = calculateGrossIncomeWithRules(netIncome, expenses, rates, rules)
//     const isVerified = verifyGrossIncome(grossIncomeCandidate, netIncome, expenses, rates)
//
//     if (isVerified) {
//       return grossIncomeCandidate
//     }
//   }
//
//   return null
// }

/**
 * Calculates the gross income from the net income, expenses, and applicable rates doing multiple
 * rounds of calculations if necessary.
 *
 * @param netIncome
 * @param expenses
 * @param rates
 *
 * @returns The gross income, which is always zero or positive.
 */
// function calculateGrossIncome(netIncome: number, expenses: Expenses, rates: Rates): number {
//   if (!areParamsValid(rates, netIncome)) {
//     if (expenses.amount) {
//       return expenses.amount
//     }
//
//     return 0
//   }
//
//   const grossIncome = findVerifiedGrossIncome(netIncome, expenses, rates)
//
//   if (grossIncome === null) {
//     throw new Error('Unable to calculate gross income: all approximations failed')
//   }
//
//   return grossIncome
// }

// export default calculateGrossIncome
