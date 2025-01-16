import { ExpensesWrapper } from '../expenses/types'
import { ThresholdKey } from '../enums'
import { Modifiers } from '../../types'

export interface ModifiersGetter {
  get(expensesWrapper: ExpensesWrapper, thresholds: ThresholdKey[]): Modifiers
}
