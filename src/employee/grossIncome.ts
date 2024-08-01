import { Rates } from './employee.types'

function calculateGrossIncome(netSalary: number, rates: Rates) {
  const { incomeRates, socialRates, healthRates } = rates

  const top = netSalary - incomeRates.credit
  const bottom = 1 - incomeRates.rate - socialRates.employeeRate - healthRates.employeeRate
  const grossSalary = top / bottom

  return Math.floor(grossSalary)
}

export default calculateGrossIncome
