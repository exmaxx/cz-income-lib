import { Expenses, Rates } from '../types'

type Options = {
  isMinHealthBaseForced?: boolean
  isMinSocialBaseForced?: boolean
  isIncomeTaxZero?: boolean
}

/**
 * Calculates the gross income from the net income, expenses, and applicable rates. However,
 * the calculation might be off from the real gross income when proper thresholds options are not applied.
 *
 * # Expense types
 *
 * The formula differs slightly based on the type of expenses:
 *  - flat-rate percentage (e.g. 60%)
 *  - or real amount (e.g. 500000 CZK)
 *
 * # Threshold options
 *
 * The calculation takes into account that the net income might have been calculated reaching:
 *  - minimal health insurance base
 *  - minimal social insurance base
 *  - zero income tax
 *
 * This happens when the profit was too low (either original gross income was too low or the expenses were too high).
 *
 * ## How to use the options
 *
 * The developer must decide which options to use based on the original net income calculation.
 *
 * You can verify the options by running the net income calculation after this function. When you see that
 * the result returned e.g. the minimal health insurance base, you should use the `isMinHealthBaseForced` option.
 *
 * @param netIncome - The income after taxes and insurance contributions
 * @param expenses - Either a fixed amount or a flat-rate percentage
 * @param rates - The rates for income tax, social insurance, and health insurance
 * @param options - Use the options when you know that the net income was calculated with some thresholds
 *
 * @returns The gross income (zero if negative)
 */
function estimateGrossIncome(
  netIncome: number,
  expenses: Expenses,
  rates: Rates,
  options: Options = {}
): number {
  if (netIncome <= 0) {
    return 0
  }

  const {
    isMinHealthBaseForced = false,
    isMinSocialBaseForced = false,
    isIncomeTaxZero = false,
  } = options

  const { incomeRates, socialRates, healthRates } = rates

  const top =
    netIncome -
    (isIncomeTaxZero ? 0 : incomeRates.nonTaxable * incomeRates.rate + incomeRates.credit) +
    (isMinSocialBaseForced ? socialRates.minBase * socialRates.rate : 0) +
    (isMinHealthBaseForced ? healthRates.minBase * healthRates.rate : 0)

  const ratesCombined =
    (isIncomeTaxZero ? 0 : incomeRates.rate) +
    (isMinSocialBaseForced ? 0 : socialRates.basePercentage * socialRates.rate) +
    (isMinHealthBaseForced ? 0 : healthRates.basePercentage * healthRates.rate)

  let result: number

  if ('percentage' in expenses) {
    const bottom = 1 - (1 - expenses.percentage) * ratesCombined

    result = Math.floor(top / bottom)
  } else {
    const bottom = 1 - ratesCombined

    result = Math.floor(top / bottom + expenses.amount)
  }

  return Math.max(result, 0)
}

export default estimateGrossIncome
