import { Rates } from './employee.types'

type NetIncomeResults = {
  /** The health insurance contributions for the employee and employer */
  health: { employee: number; employer: number }
  /** The total income tax, including both normal and high rates and the credit */
  incomeTax: number
  /** The income tax calculated using the high rate */
  incomeTaxHighRate: number
  /** The income tax calculated using the normal rate */
  incomeTaxNormalRate: number
  /** The net salary after taxes and insurance */
  netSalary: number
  /** The social insurance contributions for the employee and employer */
  social: { employee: number; employer: number }
}

/**
 * Calculate the net income for an employee based on their salary and the tax rates.
 *
 * @param salary - Monthly salary
 * @param rates - The tax and insurance rates
 */
function calculateNetIncome(salary: number, rates: Rates): NetIncomeResults {
  const { incomeRates, socialRates, healthRates } = rates

  const monthlyHighRateThreshold = incomeRates.highRateThreshold / 12

  let incomeTaxNormalRate = Math.ceil(salary * incomeRates.rate)
  let incomeTaxHighRate = 0

  if (salary > monthlyHighRateThreshold) {
    incomeTaxNormalRate = Math.ceil(monthlyHighRateThreshold * incomeRates.rate)
    incomeTaxHighRate = Math.ceil((salary - monthlyHighRateThreshold) * incomeRates.highRate)
  }

  const incomeTax = incomeTaxNormalRate + incomeTaxHighRate - incomeRates.credit

  // TODO: this is for yearly salary, implement it; after the max base, the rate is 0
  // const socialBase = Math.min(salary, socialRates.maxBase)

  const social = {
    employee: salary * socialRates.employeeRate,
    employer: salary * socialRates.employerRate,
  }

  const health = {
    employee: salary * healthRates.employeeRate,
    employer: salary * healthRates.employerRate,
  }

  const healthTotal = health.employee + health.employer

  if (healthTotal < healthRates.minAmount) {
    health.employee = healthRates.minAmount - healthTotal
  }

  const netSalary = salary - incomeTax - social.employee - health.employee

  return { incomeTax, incomeTaxNormalRate, incomeTaxHighRate, social, health, netSalary }
}

export default calculateNetIncome
