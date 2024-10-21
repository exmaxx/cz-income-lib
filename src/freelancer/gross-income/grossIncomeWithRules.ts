import { Expenses, HealthInsuranceRates, IncomeRates, Rates, SocialInsuranceRates } from '../types'
import { MAX_FLAT_RATE_AMOUNT } from '../constants'

type HighIncomeRules = {
  isHighRateIncomeTaxUsed?: boolean
  isIncomeTaxZero?: never
  isMaxFlatRateUsed?: boolean
  isMaxSocialBaseUsed?: boolean
  isMinHealthBaseUsed?: never
  isMinSocialBaseUsed?: never
}

type LowIncomeRules = {
  isHighRateIncomeTaxUsed?: never
  isIncomeTaxZero?: boolean
  isMaxFlatRateUsed?: never
  isMaxSocialBaseUsed?: never
  isMinHealthBaseUsed?: boolean
  isMinSocialBaseUsed?: boolean
}

/**
 * Rules for the gross income calculation.
 *
 * Some rules are mutually exclusive. You either aim for low income or high income and use corresponding rules.
 */
type Rules = HighIncomeRules | LowIncomeRules

/**
 * Calculates the real profit from the expenses. In case of flat-rate percentage expenses, the real profit
 * is the whole gross income.
 *
 * @param expenses
 */
function getRealProfit(expenses: Expenses) {
  const { amount } = expenses

  let grossIncomeMultiple = 1
  let grossIncomeAdjustment = 0

  if (amount) {
    grossIncomeAdjustment = -amount
  }

  return {
    grossIncomeMultiple,
    grossIncomeAdjustment,
  }
}

/**
 * A profit that is used within other calculations. It takes into account either a fixed amount expenses
 * or a flat-rate percentage.
 *
 * @param expenses
 * @param isMaxFlatRateUsed
 */
function getVirtualProfit(expenses: Expenses, { isMaxFlatRateUsed }: Rules = {}) {
  const { amount, percentage } = expenses

  let grossIncomeMultiplier = 1
  let grossIncomeAdjustment = 0

  if (percentage) {
    if (isMaxFlatRateUsed) {
      grossIncomeAdjustment = -MAX_FLAT_RATE_AMOUNT * percentage
    } else {
      grossIncomeMultiplier = 1 - percentage
    }
  } else if (amount) {
    grossIncomeAdjustment = -amount
  }

  return {
    grossIncomeMultiple: grossIncomeMultiplier,
    grossIncomeAdjustment,
  }
}

function getTax(expenses: Expenses, incomeRates: IncomeRates, rules: Rules = {}) {
  const { isIncomeTaxZero, isHighRateIncomeTaxUsed } = rules

  let grossIncomeMultiple = 0
  let grossIncomeAdjustment = 0

  const profit = getVirtualProfit(expenses, rules)

  if (!isIncomeTaxZero) {
    grossIncomeMultiple = profit.grossIncomeMultiple * incomeRates.rate

    grossIncomeAdjustment =
      profit.grossIncomeAdjustment * incomeRates.rate -
      incomeRates.nonTaxable * incomeRates.rate -
      incomeRates.credit

    if (isHighRateIncomeTaxUsed) {
      const highTax = {
        grossIncomeMultiple: profit.grossIncomeMultiple * incomeRates.highRate,
        grossIncomeAdjustment:
          (profit.grossIncomeAdjustment - incomeRates.nonTaxable - incomeRates.highRateThreshold) *
          incomeRates.highRate,
      }

      const lowTax = {
        grossIncomeMultiple: 0,
        grossIncomeAdjustment: incomeRates.highRateThreshold * incomeRates.rate,
      }

      grossIncomeMultiple = highTax.grossIncomeMultiple + lowTax.grossIncomeMultiple
      grossIncomeAdjustment =
        highTax.grossIncomeAdjustment + lowTax.grossIncomeAdjustment - incomeRates.credit
    }
  }

  return {
    grossIncomeMultiple,
    grossIncomeAdjustment,
  }
}

function getSocial(expenses: Expenses, socialRates: SocialInsuranceRates, rules: Rules = {}) {
  const { isMinSocialBaseUsed, isMaxSocialBaseUsed } = rules

  let grossIncomeMultiple = 0
  let grossIncomeAdjustment

  const profit = getVirtualProfit(expenses, rules)

  if (isMinSocialBaseUsed) {
    grossIncomeAdjustment = socialRates.minBase * socialRates.rate
  } else if (isMaxSocialBaseUsed) {
    grossIncomeAdjustment = socialRates.maxBase * socialRates.rate
  } else {
    grossIncomeMultiple = profit.grossIncomeMultiple * socialRates.basePercentage * socialRates.rate
    grossIncomeAdjustment =
      profit.grossIncomeAdjustment * socialRates.basePercentage * socialRates.rate
  }

  return {
    grossIncomeMultiple,
    grossIncomeAdjustment,
  }
}

function getHealth(expenses: Expenses, healthRates: HealthInsuranceRates, rules: Rules = {}) {
  const { isMinHealthBaseUsed } = rules

  let grossIncomeMultiple = 0
  let grossIncomeAdjustment

  const profit = getVirtualProfit(expenses, rules)

  if (isMinHealthBaseUsed) {
    grossIncomeAdjustment = healthRates.minBase * healthRates.rate
  } else {
    grossIncomeMultiple = profit.grossIncomeMultiple * healthRates.basePercentage * healthRates.rate
    grossIncomeAdjustment =
      profit.grossIncomeAdjustment * healthRates.basePercentage * healthRates.rate
  }

  return {
    grossIncomeMultiple,
    grossIncomeAdjustment,
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
 * You can verify the rules by running the net income calculation after this function. When you see that
 * the result returned e.g. the minimal health insurance base, you should use the `isMinHealthBaseUsed` rule.
 *
 * @param netIncome - The income after taxes and insurance contributions
 * @param expenses - Either a fixed amount or a flat-rate percentage
 * @param rates - The rates for income tax, social insurance, and health insurance
 * @param rules - Use the rules when you know that the net income was calculated with some thresholds
 *
 * @returns The gross income (zero if negative)
 */
function calculateGrossIncomeWithRules(
  netIncome: number,
  expenses: Expenses,
  rates: Rates,
  rules: Rules = {}
): number {
  if (netIncome <= 0) {
    return 0
  }

  const { incomeRates, socialRates, healthRates } = rates

  const tax = getTax(expenses, incomeRates, rules)
  const profit = getRealProfit(expenses)
  const social = getSocial(expenses, socialRates, rules)
  const health = getHealth(expenses, healthRates, rules)

  const top =
    netIncome -
    (profit.grossIncomeAdjustment -
      tax.grossIncomeAdjustment -
      social.grossIncomeAdjustment -
      health.grossIncomeAdjustment)

  const bottom =
    profit.grossIncomeMultiple -
    tax.grossIncomeMultiple -
    social.grossIncomeMultiple -
    health.grossIncomeMultiple

  const result = top / bottom

  return Math.max(result, 0)
}

export default calculateGrossIncomeWithRules
