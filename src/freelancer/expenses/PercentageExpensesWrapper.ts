import { ExpensesValidator, ProfitGetter, ExpensesGetter, ProfitCoefficientsGetter } from './types'
import { MAX_FLAT_RATE_INCOME } from '../constants'
import { ThresholdKey, Thresholds } from '../enums'
import { Modifiers } from '../../types'

export default class PercentageExpensesWrapper
  implements ExpensesValidator, ProfitGetter, ExpensesGetter, ProfitCoefficientsGetter
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

  getProfitModifiers(thresholds: ThresholdKey[]): Modifiers {
    const isMaxFlatRateUsed = thresholds.includes(Thresholds.MAX_FLAT_RATE)

    if (isMaxFlatRateUsed) {
      return {
        amount: -this.getVirtualExpenses(MAX_FLAT_RATE_INCOME),
        rate: 1,
      }
    } else {
      return {
        amount: 0,
        rate: 1 - this._percentage,
      }
    }
  }
}
