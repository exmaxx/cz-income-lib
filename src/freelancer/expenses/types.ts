import { ThresholdKey } from '../enums'
import { Modifiers } from '../../types'

export interface ExpensesValidator {
  /**
   * Checks whether the expenses are valid.
   */
  validate(): boolean
}

export interface ProfitGetter {
  /**
   * Gets the profit based on the gross income and expenses.
   * @param grossIncome
   */
  getProfit(grossIncome: number): number
}

export interface ExpensesGetter {
  /**
   * Gets the real expenses that were spent in the real world.
   */
  getRealExpenses(): number
}

export interface ProfitCoefficientsGetter {
  /**
   * Gets the expressions that will be used in the grand equation.
   * @param thresholds
   * @returns `amount` (used at the top of the fraction),
   * `rate` (used at the bottom)
   */
  getProfitModifiers(thresholds: ThresholdKey[]): Modifiers
}

export type ExpensesWrapperForNetIncome = ExpensesValidator & ProfitGetter & ExpensesGetter

export type ExpensesWrapperForGrossIncome = ExpensesGetter & ProfitCoefficientsGetter

export type ExpensesWrapper = ExpensesValidator & ProfitGetter & ExpensesGetter & ProfitCoefficientsGetter
