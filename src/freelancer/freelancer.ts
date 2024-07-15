import { Expenses, Rates } from './freelancer.types'

/**
 * Calculates the tax and insurance contributions for a freelancer based on their income, expenses, and applicable rates.
 *
 * @param income - The total income of the freelancer.
 * @param expenses - The expenses incurred, represented either as a fixed amount or a percentage of the income.
 * @param rates - The applicable rates for income tax, social insurance, and health insurance.
 * @returns An object containing detailed calculations of taxes and insurance contributions.
 */
function calculate(income: number, expenses: Expenses, rates: Rates) {
  const { incomeRates, socialRates, healthRates } = rates

  if ('rate' in expenses) {
    const profit = income * (1 - expenses.rate)
    const incomeTaxBase = Math.max(profit - incomeRates.nonTaxable, 0)
    const incomeTax = Math.max(incomeTaxBase * incomeRates.rate - incomeRates.credit, 0)

    const socialAssessmentBase = Math.max(
      incomeTaxBase * socialRates.basePercentage,
      socialRates.minBase
    )

    const social = Math.min(Math.ceil(socialAssessmentBase * socialRates.rate), socialRates.maxBase)

    const healthAssessmentBase = Math.max(
      incomeTaxBase * healthRates.basePercentage,
      healthRates.minBase
    )

    const health = Math.ceil(healthAssessmentBase * healthRates.rate)

    return {
      health,
      healthAssessmentBase,
      incomeTax,
      incomeTaxBase,
      social,
      socialAssessmentBase,
    }
  } else {
    // TBD
  }
}
export default calculate
