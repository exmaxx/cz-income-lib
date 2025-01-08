import { IncomeRates } from '../../types'
import { NetIncomeCalculationOptions } from '../types'
import { ProfitGetter } from '../../expenses/types'
import { NetIncomeTaxBaseResults } from './types'

/**
 * Rounds a number down to the nearest multiple of a given precision.
 */
function roundDown(value: number, precision: number) {
  return Math.floor(value / precision) * precision
}

export class IncomeTaxBaseCalculator {
  constructor(private readonly incomeRates: IncomeRates) {}

  /**
   * Calculates the income tax base based on the expenses and income rates.
   */
  calc(
    grossIncome: number,
    profitGetter: ProfitGetter,
    { isRoundingEnabled }: NetIncomeCalculationOptions
  ): NetIncomeTaxBaseResults {
    const profit = profitGetter.getProfit(grossIncome)
    const taxableProfit = profit - this.incomeRates.nonTaxable

    if (taxableProfit <= 0) {
      return {
        profit,
        taxableProfit,
        incomeTaxBase: 0,
      }
    }

    return {
      profit,
      taxableProfit,
      incomeTaxBase: isRoundingEnabled ? roundDown(taxableProfit, 100) : taxableProfit,
    }
  }
}
