import {
  HealthInsuranceRates,
  IncomeRates,
  NetIncomeCalculationOptions,
  Rates,
  SocialInsuranceRates,
} from '../types'

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

function calculateRate(
  amount: number,
  rate: number,
  { isRoundingEnabled }: NetIncomeCalculationOptions
) {
  return isRoundingEnabled ? Math.ceil(amount * rate) : amount * rate
}

/**
 * Calculate the income tax.
 *
 * Important: When the salary is higher than the high rate threshold, the high rate is applied.
 *
 * @param incomeRates - The tax rates
 * @param salary - Yearly salary
 * @param options - Options for the calculation
 */
function calculateIncomeTax(
  incomeRates: IncomeRates,
  salary: number,
  options: NetIncomeCalculationOptions
) {
  const { highRateThreshold, rate, highRate } = incomeRates

  let incomeTaxNormalRate = calculateRate(salary, rate, options)
  let incomeTaxHighRate = 0

  if (salary > highRateThreshold) {
    incomeTaxNormalRate = calculateRate(highRateThreshold, rate, options)
    incomeTaxHighRate = calculateRate(salary - highRateThreshold, highRate, options)
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
 * @param options
 */
function calculateSocial(
  salary: number,
  { maxBase, employeeRate, employerRate }: SocialInsuranceRates,
  options: NetIncomeCalculationOptions
) {
  const socialBaseEmployee = Math.min(salary, maxBase)

  return {
    employee: calculateRate(socialBaseEmployee, employeeRate, options),
    employer: calculateRate(salary, employerRate, options),
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
 * @param options
 */
function calculateHealth(
  salary: number,
  { minAmount, employeeRate, employerRate }: HealthInsuranceRates,
  options: NetIncomeCalculationOptions
) {
  const health = {
    employee: calculateRate(salary, employeeRate, options),
    employer: calculateRate(salary, employerRate, options),
  }

  const healthTotal = health.employee + health.employer

  if (healthTotal < minAmount) {
    health.employee = minAmount - health.employer
  }

  return health
}

/**
 * Calculate the net income for an employee based on their salary and the tax rates.
 *
 * @param salary - Yearly salary
 * @param rates - The tax and insurance rates
 * @param options - Options for the calculation
 */
// TODO: Rename to calculateNetSalary
function calculateNetIncome(
  salary: number,
  rates: Rates,
  options: NetIncomeCalculationOptions = { isRoundingEnabled: true }
): NetIncomeResults {
  const { incomeRates, socialRates, healthRates } = rates

  // TODO: Add rounding options. And disable rounding.

  const { incomeTaxNormalRate, incomeTaxHighRate, incomeTax } = calculateIncomeTax(
    incomeRates,
    salary,
    options
  )

  const social = calculateSocial(salary, socialRates, options)
  const health = calculateHealth(salary, healthRates, options)

  const netSalary = salary - incomeTax - social.employee - health.employee

  return { incomeTax, incomeTaxNormalRate, incomeTaxHighRate, social, health, netSalary }
}

export default calculateNetIncome
