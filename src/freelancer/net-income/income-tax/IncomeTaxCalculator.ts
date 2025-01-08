import { IncomeRates } from '../../types'
import { NetIncomeCalculationOptions } from '../types'
import { NetIncomeTaxResults } from './types'

export class IncomeTaxCalculator {
  constructor(private readonly _incomeRates: IncomeRates) {}

  private calculateIncomeTaxBasePerLevel(taxBase: number) {
    const { highRateThreshold } = this._incomeRates

    const highRateTaxBase = Math.max(0, taxBase - highRateThreshold)
    const lowRateTaxBase = taxBase - highRateTaxBase

    return { lowRateTaxBase, highRateTaxBase }
  }

  /**
   * Calculates the income tax based on the income tax base and the income rates.
   */
  calc(taxBase: number, options: NetIncomeCalculationOptions): NetIncomeTaxResults {
    const { isRoundingEnabled } = options
    const { credit, rate, highRate } = this._incomeRates

    const { highRateTaxBase, lowRateTaxBase } = this.calculateIncomeTaxBasePerLevel(taxBase)

    const highRateIncomeTax = highRateTaxBase * highRate
    const lowRateIncomeTax = lowRateTaxBase * rate

    const incomeTax = lowRateIncomeTax + highRateIncomeTax - credit

    if (incomeTax <= 0) {
      return {
        highRateTaxBase: 0,
        lowRateTaxBase: 0,
        incomeTax: 0,
        lowRateIncomeTax: 0,
        highRateIncomeTax: 0,
      }
    }

    return {
      highRateIncomeTax,
      highRateTaxBase: highRateTaxBase,
      incomeTax: isRoundingEnabled ? Math.ceil(incomeTax) : incomeTax,
      lowRateIncomeTax,
      lowRateTaxBase: lowRateTaxBase,
    }
  }
}
