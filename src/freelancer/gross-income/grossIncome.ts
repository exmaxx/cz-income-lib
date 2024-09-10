import { Expenses, HealthInsuranceRates, IncomeRates, Rates, SocialInsuranceRates } from '../types'
import { MAX_FLAT_RATE_AMOUNT } from '../constants'

type HighIncomeOptions = {
  isHighRateIncomeTaxForced?: boolean
  isIncomeTaxZero?: never
  isMaxFlatRateForced?: boolean
  isMaxSocialBaseForced?: boolean
  isMinHealthBaseForced?: never
  isMinSocialBaseForced?: never
}

type LowIncomeOptions = {
  isHighRateIncomeTaxForced?: never
  isIncomeTaxZero?: boolean
  isMaxFlatRateForced?: never
  isMaxSocialBaseForced?: never
  isMinHealthBaseForced?: boolean
  isMinSocialBaseForced?: boolean
}

/**
 * Options for the gross income estimation.
 *
 * Some options are mutually exclusive. You either aim for low income or high income and use corresponding options.
 */
type Options = HighIncomeOptions | LowIncomeOptions

/**
 * Calculates the real profit from the expenses. In case of flat-rate percentage expenses, the real profit
 * is the whole gross income.
 *
 * @param expenses
 */
function getRealProfit(expenses: Expenses) {
  const { amount } = expenses

  let grossIncomeMultiple = 1
  let sum = 0

  if (amount) {
    sum = -amount
  }

  return {
    grossIncomeMultiple,
    sum,
  }
}

/**
 * A profit that is used within other calculations. It takes into account either a fixed amount expenses
 * or a flat-rate percentage.
 *
 * @param expenses
 * @param isMaxFlatRateForced
 */
function getVirtualProfit(expenses: Expenses, { isMaxFlatRateForced }: Options = {}) {
  const { amount, percentage } = expenses

  let grossIncomeMultiplier = 1
  let sum = 0

  if (percentage) {
    if (isMaxFlatRateForced) {
      sum = -MAX_FLAT_RATE_AMOUNT * percentage
    } else {
      grossIncomeMultiplier = 1 - percentage
    }
  } else if (amount) {
    sum = -amount
  }

  return {
    grossIncomeMultiple: grossIncomeMultiplier,
    sum,
  }
}

function getTax(expenses: Expenses, incomeRates: IncomeRates, options: Options = {}) {
  const { isIncomeTaxZero, isHighRateIncomeTaxForced } = options

  let grossIncomeMultiple = 0
  let sum = 0

  const profit = getVirtualProfit(expenses, options)

  if (!isIncomeTaxZero) {
    grossIncomeMultiple = profit.grossIncomeMultiple * incomeRates.rate

    sum =
      profit.sum * incomeRates.rate - incomeRates.nonTaxable * incomeRates.rate - incomeRates.credit

    if (isHighRateIncomeTaxForced) {
      const highTax = {
        grossIncomeMultiple: profit.grossIncomeMultiple * incomeRates.highRate,
        sum:
          (profit.sum - incomeRates.nonTaxable - incomeRates.highRateThreshold) *
          incomeRates.highRate,
      }

      const lowTax = {
        grossIncomeMultiple: 0,
        sum: incomeRates.highRateThreshold * incomeRates.rate,
      }

      grossIncomeMultiple = highTax.grossIncomeMultiple + lowTax.grossIncomeMultiple
      sum = highTax.sum + lowTax.sum - incomeRates.credit
    }
  }

  return {
    grossIncomeMultiple,
    sum,
  }
}

function getSocial(expenses: Expenses, socialRates: SocialInsuranceRates, options: Options = {}) {
  const { isMinSocialBaseForced, isMaxSocialBaseForced } = options

  let grossIncomeMultiple = 0
  let sum

  const profit = getVirtualProfit(expenses, options)

  if (isMinSocialBaseForced) {
    sum = socialRates.minBase * socialRates.rate
  } else if (isMaxSocialBaseForced) {
    sum = socialRates.maxBase * socialRates.rate
  } else {
    grossIncomeMultiple = profit.grossIncomeMultiple * socialRates.basePercentage * socialRates.rate
    sum = profit.sum * socialRates.basePercentage * socialRates.rate
  }

  return {
    grossIncomeMultiple,
    sum,
  }
}

function getHealth(expenses: Expenses, healthRates: HealthInsuranceRates, options: Options = {}) {
  const { isMinHealthBaseForced } = options

  let grossIncomeMultiple = 0
  let sum

  const profit = getVirtualProfit(expenses, options)

  if (isMinHealthBaseForced) {
    sum = healthRates.minBase * healthRates.rate
  } else {
    grossIncomeMultiple = profit.grossIncomeMultiple * healthRates.basePercentage * healthRates.rate
    sum = profit.sum * healthRates.basePercentage * healthRates.rate
  }

  return {
    grossIncomeMultiple,
    sum,
  }
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

  const { incomeRates, socialRates, healthRates } = rates

  const tax = getTax(expenses, incomeRates, options)
  const profit = getRealProfit(expenses)
  const social = getSocial(expenses, socialRates, options)
  const health = getHealth(expenses, healthRates, options)

  const top = netIncome - profit.sum + tax.sum + social.sum + health.sum

  const bottom =
    profit.grossIncomeMultiple -
    tax.grossIncomeMultiple -
    social.grossIncomeMultiple -
    health.grossIncomeMultiple

  const result = Math.round(top / bottom)

  return Math.max(result, 0)
}

export default estimateGrossIncome
