import { HealthInsuranceRates, IncomeRates, NetIncomeCalculationOptions, Rates, SocialInsuranceRates } from '../types'
import { Thresholds } from '../constants'

interface NetSalaryResults {
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
  /** The thresholds that were reached during the calculation */
  reachedThresholds: string[]
}

function calculateAmount(amount: number, rate: number, { isRoundingEnabled }: NetIncomeCalculationOptions) {
  return isRoundingEnabled ? Math.ceil(amount * rate) : amount * rate
}

/**
 * Calculate the income tax.
 *
 * Important: When the salary is higher than the high rate threshold, the high rate is applied.
 *
 * @param salary - Yearly salary
 * @param incomeRates - The tax rates
 * @param options - Options for the calculation
 */
function calculateIncomeTax(salary: number, incomeRates: IncomeRates, options: NetIncomeCalculationOptions) {
  const { highRateThreshold, rate, highRate } = incomeRates

  const reachedThresholds: string[] = []

  let incomeTaxNormalRate = calculateAmount(salary, rate, options)
  let incomeTaxHighRate = 0

  if (salary > highRateThreshold) {
    incomeTaxNormalRate = calculateAmount(highRateThreshold, rate, options)
    incomeTaxHighRate = calculateAmount(salary - highRateThreshold, highRate, options)

    reachedThresholds.push(Thresholds.HIGH_TAX)
  }

  const incomeTax = Math.max(incomeTaxNormalRate + incomeTaxHighRate - incomeRates.credit, 0)

  if (incomeTax === 0) {
    reachedThresholds.push(Thresholds.ZERO_TAX)
  }

  return { incomeTaxNormalRate, incomeTaxHighRate, incomeTax, reachedThresholds }
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

  const reachedThresholds: string[] = []

  if (socialBaseEmployee === maxBase) {
    reachedThresholds.push(Thresholds.MAX_BASE_SOCIAL)
  }

  return {
    social: {
      employee: calculateAmount(socialBaseEmployee, employeeRate, options),
      employer: calculateAmount(salary, employerRate, options),
    },
    reachedThresholds,
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
    employee: calculateAmount(salary, employeeRate, options),
    employer: calculateAmount(salary, employerRate, options),
  }

  const healthTotal = health.employee + health.employer

  const reachedThresholds: string[] = []

  if (healthTotal < minAmount) {
    health.employee = minAmount - health.employer

    reachedThresholds.push(Thresholds.MIN_HEALTH)
  }

  return { health, reachedThresholds }
}

/**
 * Calculate the net income for an employee based on their salary and the tax rates.
 *
 * @param salary - Yearly salary
 * @param rates - The tax and insurance rates
 * @param options - Options for the calculation
 */
function calculateNetSalary(
  salary: number,
  rates: Rates,
  options: NetIncomeCalculationOptions = { isRoundingEnabled: true }
): NetSalaryResults {
  const { incomeRates, socialRates, healthRates } = rates

  const {
    incomeTaxNormalRate,
    incomeTaxHighRate,
    incomeTax,
    reachedThresholds: salaryThresholds,
  } = calculateIncomeTax(salary, incomeRates, options)

  const { social, reachedThresholds: socialThresholds } = calculateSocial(salary, socialRates, options)

  const { health, reachedThresholds: healthThresholds } = calculateHealth(salary, healthRates, options)

  const netSalary = salary - incomeTax - social.employee - health.employee

  return {
    incomeTax,
    incomeTaxNormalRate,
    incomeTaxHighRate,
    social,
    health,
    netSalary,
    reachedThresholds: [...salaryThresholds, ...socialThresholds, ...healthThresholds],
  }
}

export default calculateNetSalary
