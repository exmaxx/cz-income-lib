import { CalculationModifiers } from '../types'
import { ThresholdKey } from '../enums'

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

export interface RealExpensesGetter {
  /**
   * Gets the real expenses that were spent in the real world.
   */
  getRealExpenses(): number
}

// TODO: This interface is not needed anywhere outside of the wrappers.
export interface VirtualExpensesGetter {
  /**
   * Get expenses for the calculation. Can be "virtual" (i.e. percentage of gross income)
   * or "real" (i.e. fixed amount).
   * @param income
   */
  getCalculationExpenses(income: number): number
}

export interface ProfitCoefficientsGetter {
  /**
   * Gets the expressions that will be used in the grand equation.
   * @param thresholds
   * @returns `grossIncomeAdjustment` (used at the top of the fraction),
   * `grossIncomeMultiplier` (used at the bottom)
   */
  getProfitModifiers(thresholds: ThresholdKey[]): CalculationModifiers
}

export type NetIncomeExpensesProvider = ExpensesValidator & ProfitGetter & RealExpensesGetter

export type ExpensesWrapper = NetIncomeExpensesProvider & RealExpensesGetter & ProfitCoefficientsGetter
