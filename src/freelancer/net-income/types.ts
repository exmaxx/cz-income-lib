import { NetIncomeHealthResults } from './health/types'
import { NetIncomeSocialResults } from './social/types'
import { NetIncomeTaxBaseResults, NetIncomeTaxResults } from './income-tax/types'

/**
 * Options for the net income calculation.
 */
export interface NetIncomeCalculationOptions {
  /** Is:
   * - `true` - for normal calculation; the law requires some roundings (up, down, some to single digit,
   *   some to hundreds, etc.)
   * - `false` - for double-checking previously calculated gross income (using the [grossIncome](./gross-income/grossIncome.ts) function),
   *   I need to disable rounding because the gross income calculation (which reverts net income calculation)
   *   is not able to guess what roundings were used in the original net income calculation
   */
  isRoundingEnabled?: boolean
}

export interface NetIncomeEarningsResults {
  netIncome: number
}

/**
 * The result of the net income calculation.
 */
export type NetIncomeResults = NetIncomeEarningsResults &
  NetIncomeTaxBaseResults &
  NetIncomeTaxResults &
  NetIncomeHealthResults &
  NetIncomeSocialResults

// FIXME: Add ability to ask for the reached thresholds.
// export interface NetIncomeReachedThresholds {
//   reachedThresholds: Set<ThresholdKey>
// }
//
// export type NetIncomeResultsWithThresholds = NetIncomeResults & NetIncomeReachedThresholds
