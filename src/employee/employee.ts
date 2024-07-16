import { Rates } from './employee.types'

function calculate(rates: Rates, salary: number) {
  const { incomeRates, socialRates, healthRates } = rates

  const incomeTax = salary * incomeRates.rate - incomeRates.credit

  const social = {
    employee: salary * socialRates.employeeRate,
    employer: salary * socialRates.employerRate,
  }

  const health = {
    employee: salary * healthRates.employeeRate,
    employer: salary * healthRates.employerRate,
  }

  return { incomeTax, social, health }
}

export default calculate
