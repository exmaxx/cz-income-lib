import calculateGrossIncomeWithRules from './grossIncomeWithRules'
import calculateNetIncome from '../net-income/netIncome'
import { Expenses, Rates } from '../types'
import { areAlmostEqual } from '../../utils'

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
 */
function calculateGrossIncome(netIncome: number, expenses: Expenses, rates: Rates): number {
  if (netIncome <= 0) {
    return 0
  }

  let grossIncome = calculateGrossIncomeWithRules(netIncome, expenses, rates)
  let verification = calculateNetIncome(grossIncome, expenses, rates, { isRoundingEnabled: false })

  if (areAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  // TODO: Can we do a check to know whether to go the low or high income path?

  grossIncome = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
    isMinHealthBaseUsed: true,
  })

  verification = calculateNetIncome(grossIncome, expenses, rates, { isRoundingEnabled: false })

  if (areAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  grossIncome = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
    isMinHealthBaseUsed: true,
    isMinSocialBaseUsed: true,
  })

  verification = calculateNetIncome(grossIncome, expenses, rates, { isRoundingEnabled: false })

  if (areAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  grossIncome = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
    isMinHealthBaseUsed: true,
    isMinSocialBaseUsed: true,
    isIncomeTaxZero: true,
  })

  verification = calculateNetIncome(grossIncome, expenses, rates, { isRoundingEnabled: false })

  if (areAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  grossIncome = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
    isMaxSocialBaseUsed: true,
  })

  verification = calculateNetIncome(grossIncome, expenses, rates, { isRoundingEnabled: false })

  if (areAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  grossIncome = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
    isMaxSocialBaseUsed: true,
    isHighRateIncomeTaxUsed: true,
  })

  verification = calculateNetIncome(grossIncome, expenses, rates, { isRoundingEnabled: false })

  if (areAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  grossIncome = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
    isMaxSocialBaseUsed: true,
    isHighRateIncomeTaxUsed: true,
    isMaxFlatRateUsed: true,
  })

  verification = calculateNetIncome(grossIncome, expenses, rates, { isRoundingEnabled: false })

  if (areAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  const lowestTaxAndInsurance = verification.social + verification.health // tax is already 0, social and health base is at minimum

  if ('amount' in expenses) {
    const amount = expenses.amount || 0

    // we are at the state where `expenses.amount + lowestTaxAndInsurance` together mean 0 net income
    // so to get the real gross income we need to add the original `netIncome`
    grossIncome = amount + lowestTaxAndInsurance + netIncome
  } else {
    throw new Error(
      'Unable to calculate gross income (flat-rate calculation should have not reached this point)'
    )
  }

  verification = calculateNetIncome(grossIncome, expenses, rates, { isRoundingEnabled: false })

  if (areAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  throw new Error('Unable to calculate gross income (all approximations failed)')
}

export default calculateGrossIncome
