import { ExpensesValidator, ProfitGetter, ExpensesGetter, ProfitCoefficientsGetter } from './types'

import { Modifiers } from '../../types'

export default class FixedExpensesWrapper
  implements ExpensesValidator, ProfitGetter, ExpensesGetter, ProfitCoefficientsGetter
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

  getProfitModifiers(): Modifiers {
    return {
      amount: -this.getRealExpenses(),
      rate: 1,
    }
  }
}
