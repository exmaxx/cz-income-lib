import { Expenses, Rates } from './freelancer.types'

function calculateGrossIncome(netIncome: number, expenses: Expenses, rates: Rates): number {
  const { incomeRates, socialRates, healthRates } = rates

  const top = netIncome - incomeRates.nonTaxable * incomeRates.rate - incomeRates.credit

  const ratesCombined =
    incomeRates.rate +
    socialRates.basePercentage * socialRates.rate +
    healthRates.basePercentage * healthRates.rate

  let result: number

  if ('rate' in expenses) {
    const bottom = 1 - (1 - expenses.rate) * ratesCombined

    result = Math.floor(top / bottom)
  } else {
    const bottom = 1 - ratesCombined

    result = Math.floor(top / bottom + expenses.amount)
  }

  return Math.max(result, 0)
}

export default calculateGrossIncome
