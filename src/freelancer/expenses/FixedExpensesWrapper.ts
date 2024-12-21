import {
  ExpensesValidator,
  ProfitGetter,
  RealExpensesGetter,
  ProfitCoefficientsGetter,
} from './types'
import { CalculationModifiers } from '../types'

export default class FixedExpensesWrapper
  implements ExpensesValidator, ProfitGetter, RealExpensesGetter, ProfitCoefficientsGetter
{
  constructor(private readonly _amount: number) {}

  validate(): boolean {
    return this._amount >= 0
  }

  getProfit(grossIncome: number): number {
    const expenses = this.getRealExpenses()

    return grossIncome - expenses
  }

  getRealExpenses(): number {
    return this._amount
  }

  getProfitModifiers(): CalculationModifiers {
    return {
      grossIncomeAdjustment: -this.getRealExpenses(),
      grossIncomeMultiplier: 1,
    }
  }
}
