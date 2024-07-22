import { Expenses, Rates } from './freelancer.types'

function calculateGrossIncome(netIncome: number, expenses: Expenses, rates: Rates): number {
  const { incomeRates, socialRates, healthRates } = rates

  let result: number

  if ('rate' in expenses) {
    const top = netIncome - incomeRates.nonTaxable * incomeRates.rate - incomeRates.credit

    const bottom =
      1 -
      (1 - expenses.rate) * incomeRates.rate -
      (1 - expenses.rate) * socialRates.basePercentage * socialRates.rate -
      (1 - expenses.rate) * healthRates.basePercentage * healthRates.rate

    result = Math.floor(top / bottom)
  }

  return Math.max(result, 0)
}

export default calculateGrossIncome
