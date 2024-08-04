import estimateGrossIncome from './grossIncome'
import calculateNetIncome from '../net-income/netIncome'
import { isAlmostEqual } from '../../utils'
import { Expenses, Rates } from '../types'

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
 * Some small differences also appear due to rounding used in the original net income calculation.
 *
 * # "Almost equal" checks
 *
 * Due to things mentioned above, it is hard to get the exact original number back. Therefore, we use
 * the `isAlmostEqual` function to check if the result is close enough to the original number.
 *
 * > E.g. the result can be 1000000 CZK gross income, but also as 999999 CZK.
 *
 * @param netIncome - The income after taxes and insurance contributions
 * @param expenses - Either a fixed amount or a flat-rate percentage
 * @param rates - The rates for income tax, social insurance, and health insurance
 */
function calculateGrossIncomeVerified(netIncome: number, expenses: Expenses, rates: Rates): number {
  if (netIncome <= 0) {
    return 0
  }

  let grossIncome = estimateGrossIncome(netIncome, expenses, rates)
  let verification = calculateNetIncome(grossIncome, expenses, rates)

  // due to rounding we accept a small difference
  if (isAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  grossIncome = estimateGrossIncome(netIncome, expenses, rates, {
    isMinHealthBaseForced: true,
  })

  verification = calculateNetIncome(grossIncome, expenses, rates)

  // due to rounding we accept a small difference
  if (isAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  grossIncome = estimateGrossIncome(netIncome, expenses, rates, {
    isMinHealthBaseForced: true,
    isMinSocialBaseForced: true,
  })

  verification = calculateNetIncome(grossIncome, expenses, rates)

  // due to rounding we accept a small difference
  if (isAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  grossIncome = estimateGrossIncome(netIncome, expenses, rates, {
    isMinHealthBaseForced: true,
    isMinSocialBaseForced: true,
    isIncomeTaxZero: true,
  })

  verification = calculateNetIncome(grossIncome, expenses, rates)

  // due to rounding we accept a small difference
  if (isAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  const lowestTaxAndInsurance = verification.social + verification.health // tax is already 0, social and health base is at minimum

  if ('amount' in expenses) {
    // we are at the state where `expenses.amount + lowestTaxAndInsurance` together mean 0 net income
    // so to get the real gross income we need to add the original `netIncome`
    grossIncome = expenses.amount + lowestTaxAndInsurance + netIncome
  } else {
    throw new Error(
      'Unable to calculate gross income (flat-rate calculation should have not reached this point)'
    )
  }

  verification = calculateNetIncome(grossIncome, expenses, rates)

  // due to rounding we accept a small difference
  if (isAlmostEqual(verification.netIncome, netIncome)) {
    return grossIncome
  }

  throw new Error('Unable to calculate gross income (all approximations failed)')
}

export default calculateGrossIncomeVerified
