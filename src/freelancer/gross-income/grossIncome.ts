import calculateGrossIncomeWithRules from './grossIncomeWithRules'
import calculateNetIncome from '../net-income/netIncome'
import { Expenses, NetIncomeResult, Rates } from '../types'
import { areTechnicallyEqual } from '../../utils'

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
 * @param expenses - Either a fixed amount or a flat-rate percentage
 * @param rates - The rates for income tax, social insurance, and health insurance
 * @returns The gross income, which is always zero or positive.
 */
function calculateGrossIncome(netIncome: number, expenses: Expenses, rates: Rates): number {
  const minDeductions =
    rates.healthRates.minBase * rates.healthRates.rate +
    rates.socialRates.minBase * rates.socialRates.rate

  // The smallest possible net income is -minDeductions. This is the case when the gross income is zero
  // and you have to pay the minimal health and social insurance. Anything below this is not possible.
  if (netIncome < -minDeductions) {
    if ('amount' in expenses) {
      return expenses.amount || 0
    }

    return 0
  }

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

  let grossIncome: number | null = null
  let verification: NetIncomeResult | null = null

  for (const rules of ruleSets) {
    grossIncome = calculateGrossIncomeWithRules(netIncome, expenses, rates, rules)
    verification = calculateNetIncome(grossIncome, expenses, rates, { isRoundingEnabled: false })

    if (areTechnicallyEqual(verification.netIncome, netIncome)) {
      return grossIncome
    }
  }

  throw new Error('Unable to calculate gross income: all approximations failed')
}

export default calculateGrossIncome
