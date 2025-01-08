import { Rates } from '../types'
import { NetIncomeCalculationOptions, NetIncomeResults } from './types'
import { IncomeTaxBaseCalculator } from './income-tax/IncomeTaxBaseCalculator'
import { IncomeTaxCalculator } from './income-tax/IncomeTaxCalculator'
import { SocialCalculator } from './social/SocialCalculator'
import { HealthCalculator } from './health/HealthCalculator'
import { ExpensesWrapperForNetIncome, ExpensesGetter } from '../expenses/types'

export default class NetIncomeCalculator {
  /**
   * @param rates - The rates for income tax, social insurance, and health insurance
   */
  constructor(private readonly rates: Rates) {}

  /**
   * Calculates the tax and insurance contributions for a freelancer based on their income, expenses,
   * and applicable rates.
   *
   * @param grossIncome - The income of the freelancer
   * @param expensesWrapper - The expenses wrapper, represented either as a fixed amount or a flat-rate percentage
   *  of the income
   * @param options - Additional options for the calculation
   * @returns An object containing detailed calculations of taxes and insurance contributions
   */
  calculate(
    grossIncome: number,
    expensesWrapper: ExpensesWrapperForNetIncome,
    options: NetIncomeCalculationOptions = { isRoundingEnabled: true }
  ): NetIncomeResults {
    if (!expensesWrapper.validate()) {
      throw new Error('Expenses cannot be negative')
    }

    const incomeTaxBaseCalculator = new IncomeTaxBaseCalculator(this.rates.incomeRates)
    const taxBaseResults = incomeTaxBaseCalculator.calc(grossIncome, expensesWrapper, options)
    const { incomeTaxBase } = taxBaseResults

    const incomeTaxCalculator = new IncomeTaxCalculator(this.rates.incomeRates)
    const taxResults = incomeTaxCalculator.calc(incomeTaxBase, options)
    const { incomeTax } = taxResults

    const socialCalculator = new SocialCalculator(this.rates.socialRates)
    const socialResults = socialCalculator.calc(incomeTaxBase, options)
    const { social } = socialResults

    const healthCalculator = new HealthCalculator(this.rates.healthRates)
    const healthResults = healthCalculator.calc(incomeTaxBase, options)
    const { health } = healthResults

    let netIncome = this.calculateNetIncome(grossIncome, incomeTax, social, health)

    netIncome = this.adjustNetIncomeByExpenses(netIncome, expensesWrapper)

    return {
      ...healthResults,
      ...socialResults,
      ...taxBaseResults,
      ...taxResults,
      incomeTaxBase,
      netIncome,
    }
  }

  private calculateNetIncome(grossIncome: number, incomeTax: number, social: number, health: number): number {
    return grossIncome - incomeTax - social - health
  }

  private adjustNetIncomeByExpenses(netIncome: number, expensesGetter: ExpensesGetter) {
    return netIncome - expensesGetter.getRealExpenses()
  }
}
