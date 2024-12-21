import { CalculationModifiers } from '../../types'
import { TaxGetter } from './types'

export class ZeroTaxCalculator implements TaxGetter {
  calculate(): CalculationModifiers {
    return {
      grossIncomeAdjustment: 0,
      grossIncomeMultiplier: 0,
    }
  }
}
