import { TaxGetter } from './types'
import { CalculationModifiers, IncomeRates } from '../../types'
import { ProfitCoefficientsGetter } from '../../expenses/types'
import { ThresholdKey } from '../../enums'

export class HighRateTaxCalculator implements TaxGetter {
  constructor(private readonly incomeRates: IncomeRates) {}

  calculate(
    expensesWrapper: ProfitCoefficientsGetter,
    thresholds: ThresholdKey[]
  ): CalculationModifiers {
    const { credit } = this.incomeRates

    const profit = expensesWrapper.getProfitModifiers(thresholds)

    const highTax = this.getHighTaxModifiers(profit)
    const lowTax = this.getLowTaxModifiers()

    return {
      grossIncomeAdjustment: highTax.grossIncomeAdjustment + lowTax.grossIncomeAdjustment - credit,
      grossIncomeMultiplier: highTax.grossIncomeMultiplier + lowTax.grossIncomeMultiplier,
    }
  }

  private getLowTaxModifiers() {
    const { highRateThreshold, rate } = this.incomeRates

    return {
      grossIncomeAdjustment: highRateThreshold * rate,
      grossIncomeMultiplier: 0,
    }
  }

  private getHighTaxModifiers(profit: CalculationModifiers) {
    const { highRate, highRateThreshold, nonTaxable } = this.incomeRates

    const highTaxAmount = profit.grossIncomeAdjustment - nonTaxable - highRateThreshold

    return {
      grossIncomeAdjustment: highTaxAmount * highRate,
      grossIncomeMultiplier: profit.grossIncomeMultiplier * highRate,
    }
  }
}
