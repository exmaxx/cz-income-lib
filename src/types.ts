/**
 * These modifiers will be passed to the grand equation of the gross income calculation (i.e.
 * reverse of the net income formula).
 */
export interface Modifiers {
  /**
   * The amount that is originally subtracted from the gross income when calculation the net income.
   *
   * This is used at the grand equation for the gross income calculation. All the gross income
   * adjustments are added or subtracted from the net income.
   *
   * Any fixed values (e.g. real expenses) are added here.
   */
  amount: number

  /**
   * The rate is a multiplier of the gross income in the original calculation of the net income
   * (e.g. flat-rate percentage value).
   */
  rate: number
}
