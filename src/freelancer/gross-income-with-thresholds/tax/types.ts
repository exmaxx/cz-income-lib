import { CalculationModifiers } from '../../types'
import { ProfitCoefficientsGetter } from '../../expenses/types'
import { ThresholdKey } from '../../enums'

export interface TaxGetter {
  calculate(expensesWrapper: ProfitCoefficientsGetter, thresholds: ThresholdKey[]): CalculationModifiers
}
