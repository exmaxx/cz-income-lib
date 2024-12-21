import {
  CalculationCoefficients,
  Expenses,
  HealthInsuranceRates,
  IncomeRates,
  Rates,
  SocialInsuranceRates,
} from '../types'
import { ThresholdKey, Thresholds } from '../enums'
import { MAX_FLAT_RATE_AMOUNT } from '../constants'

/**
 * Calculates the real profit from the expenses. In case of flat-rate percentage expenses, the real profit
 * is the whole gross income.
 *
 * @param expenses
 */
function getRealProfit(expenses: Expenses): CalculationCoefficients {
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
 * @param thresholds
 */
function getVirtualProfit(expenses: Expenses, thresholds: ThresholdKey[]): CalculationCoefficients {
  const { amount, percentage } = expenses
  const { MAX_FLAT_RATE } = Thresholds

  let grossIncomeMultiplier = 1
  let grossIncomeAdjustment = 0

  if (percentage) {
    const isMaxFlatRateUsed = thresholds.includes(MAX_FLAT_RATE)

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

function getTax(
  expenses: Expenses,
  incomeRates: IncomeRates,
  thresholds: ThresholdKey[]
): CalculationCoefficients {
  const { HIGH_TAX, ZERO_TAX } = Thresholds

  let grossIncomeMultiple = 0
  let grossIncomeAdjustment = 0

  const isIncomeTaxZero = thresholds.includes(ZERO_TAX)
  const isHighRateIncomeTaxUsed = thresholds.includes(HIGH_TAX)

  const profit = getVirtualProfit(expenses, thresholds)

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

function getSocial(
  expenses: Expenses,
  socialRates: SocialInsuranceRates,
  thresholds: ThresholdKey[]
): CalculationCoefficients {
  const { MAX_BASE_SOCIAL, MIN_BASE_SOCIAL } = Thresholds

  let grossIncomeMultiple = 0
  let grossIncomeAdjustment

  const isMinSocialBaseUsed = thresholds.includes(MIN_BASE_SOCIAL)
  const isMaxSocialBaseUsed = thresholds.includes(MAX_BASE_SOCIAL)

  const profit = getVirtualProfit(expenses, thresholds)

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

function getHealth(
  expenses: Expenses,
  healthRates: HealthInsuranceRates,
  thresholds: ThresholdKey[]
): CalculationCoefficients {
  const { MIN_BASE_HEALTH } = Thresholds

  let grossIncomeMultiple = 0
  let grossIncomeAdjustment

  const isMinHealthBaseUsed = thresholds.includes(MIN_BASE_HEALTH)

  const profit = getVirtualProfit(expenses, thresholds)

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
 * @param thresholds - The thresholds to use in the calculation
 *
 * @returns The gross income
 */
function calculateGrossIncomeWithRules(
  netIncome: number,
  expenses: Expenses,
  rates: Rates,
  thresholds: ThresholdKey[] = []
): number {
  const { incomeRates, socialRates, healthRates } = rates

  const tax = getTax(expenses, incomeRates, thresholds)
  const profit = getRealProfit(expenses)
  const social = getSocial(expenses, socialRates, thresholds)
  const health = getHealth(expenses, healthRates, thresholds)

  const fractionTop =
    netIncome -
    (profit.grossIncomeAdjustment -
      tax.grossIncomeAdjustment -
      social.grossIncomeAdjustment -
      health.grossIncomeAdjustment)

  const fractionBottom =
    profit.grossIncomeMultiple -
    tax.grossIncomeMultiple -
    social.grossIncomeMultiple -
    health.grossIncomeMultiple

  return fractionTop / fractionBottom
}

export default calculateGrossIncomeWithRules
