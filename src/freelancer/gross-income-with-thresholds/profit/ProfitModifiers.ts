import { ExpensesGetter } from '../../expenses/types'
import { ModifiersGetter } from '../types'
import { Modifiers } from '../../../types'

export default class ProfitModifiers implements ModifiersGetter {
  get(expensesGetter: ExpensesGetter): Modifiers {
    let amountAdjustment = -expensesGetter.getRealExpenses()
    let rateAdjustment = 1

    return {
      amount: amountAdjustment,
      rate: rateAdjustment,
    }
  }
}
