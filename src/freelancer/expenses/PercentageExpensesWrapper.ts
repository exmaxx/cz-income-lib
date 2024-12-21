import {
  ExpensesValidator,
  ProfitGetter,
  RealExpensesGetter,
  ProfitCoefficientsGetter,
} from './types'
import { MAX_FLAT_RATE_INCOME } from '../constants'
import { CalculationModifiers } from '../types'
import { ThresholdKey, Thresholds } from '../enums'

export default class PercentageExpensesWrapper
  implements ExpensesValidator, ProfitGetter, RealExpensesGetter, ProfitCoefficientsGetter
{
  constructor(private readonly _percentage: number) {}

  validate(): boolean {
    return true
  }

  getProfit(grossIncome: number): number {
    const cappedIncome = Math.min(grossIncome, MAX_FLAT_RATE_INCOME)
    const expenses = this.getVirtualExpenses(cappedIncome)

    return grossIncome - expenses
  }

  getRealExpenses(): number {
    return 0
  }

  getVirtualExpenses(income: number): number {
    return income * this._percentage
  }

  getProfitModifiers(thresholds: ThresholdKey[]): CalculationModifiers {
    const isMaxFlatRateUsed = thresholds.includes(Thresholds.MAX_FLAT_RATE)

    if (isMaxFlatRateUsed) {
      return {
        grossIncomeAdjustment: -this.getVirtualExpenses(MAX_FLAT_RATE_INCOME),
        grossIncomeMultiplier: 1,
      }
    } else {
      return {
        grossIncomeAdjustment: 0,
        grossIncomeMultiplier: 1 - this._percentage,
      }
    }
  }
}
