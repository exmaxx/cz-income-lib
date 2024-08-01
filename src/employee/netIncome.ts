import { HealthInsuranceRates, IncomeRates, Rates, SocialInsuranceRates } from './employee.types'

interface NetIncomeResults {
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
 * Calculate the income tax.
 *
 * Important: When the salary is higher than the high rate threshold, the high rate is applied.
 *
 * @param incomeRates - The tax rates
 * @param salary - Monthly salary
 */
function calculateIncomeTax(incomeRates: IncomeRates, salary: number) {
  const monthlyHighRateThreshold = incomeRates.highRateThreshold / 12

  let incomeTaxNormalRate = Math.ceil(salary * incomeRates.rate)
  let incomeTaxHighRate = 0

  if (salary > monthlyHighRateThreshold) {
    incomeTaxNormalRate = Math.ceil(monthlyHighRateThreshold * incomeRates.rate)
    incomeTaxHighRate = Math.ceil((salary - monthlyHighRateThreshold) * incomeRates.highRate)
  }

  const incomeTax = Math.max(incomeTaxNormalRate + incomeTaxHighRate - incomeRates.credit, 0)

  return { incomeTaxNormalRate, incomeTaxHighRate, incomeTax }
}

/**
 * Calculate the social insurance contributions.
 *
 * Important: When the salary is higher than the maximum base, the rate is 0.
 *
 * @param salary
 * @param socialRates
 */
function calculateSocial(salary: number, socialRates: SocialInsuranceRates) {
  const socialBase = Math.min(salary, socialRates.maxBase / 12)

  return {
    employee: Math.ceil(socialBase * socialRates.employeeRate),
    employer: Math.ceil(socialBase * socialRates.employerRate),
  }
}

/**
 * Calculate the health insurance contributions.
 *
 * Important: When the health insurance contributions are less than the minimum amount,
 * the employee pays the difference.
 *
 * @param salary
 * @param healthRates
 */
function calculateHealth(salary: number, healthRates: HealthInsuranceRates) {
  const health = {
    employee: salary * healthRates.employeeRate,
    employer: salary * healthRates.employerRate,
  }

  const healthTotal = health.employee + health.employer

  if (healthTotal < healthRates.minAmount) {
    health.employee = healthRates.minAmount - health.employer
  }

  return health
}

/**
 * Calculate the net income for an employee based on their salary and the tax rates.
 *
 * @param salary - Monthly salary
 * @param rates - The tax and insurance rates
 */
function calculateNetIncome(salary: number, rates: Rates): NetIncomeResults {
  const { incomeRates, socialRates, healthRates } = rates

  const { incomeTaxNormalRate, incomeTaxHighRate, incomeTax } = calculateIncomeTax(
    incomeRates,
    salary
  )

  const social = calculateSocial(salary, socialRates)
  const health = calculateHealth(salary, healthRates)

  const netSalary = salary - incomeTax - social.employee - health.employee

  return { incomeTax, incomeTaxNormalRate, incomeTaxHighRate, social, health, netSalary }
}

export default calculateNetIncome
