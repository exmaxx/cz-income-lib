import calculateGrossSalaryWithRules from './grossSalaryWithRules'
import calculateNetSalary from '../net-salary/netSalary'
import { AVG_SALARY_MONTHLY } from '../constants'
import { Rates } from '../types'

function calculateGrossSalary(netSalary: number, rates: Rates): number {
  let grossSalary = calculateGrossSalaryWithRules(netSalary, rates)
  let verification = calculateNetSalary(grossSalary, rates, { isRoundingEnabled: false })

  if (verification.netSalary === netSalary) {
    return grossSalary
  }

  const avgSalaryYearly = AVG_SALARY_MONTHLY * 12

  if (netSalary < avgSalaryYearly) {
    grossSalary = calculateGrossSalaryWithRules(netSalary, rates, {
      isMinHealthUsed: true,
    })

    verification = calculateNetSalary(grossSalary, rates, { isRoundingEnabled: false })

    if (verification.netSalary === netSalary) {
      return grossSalary
    }

    grossSalary = calculateGrossSalaryWithRules(netSalary, rates, {
      isMinHealthUsed: true,
      isTaxZero: true,
    })

    verification = calculateNetSalary(grossSalary, rates, { isRoundingEnabled: false })

    if (verification.netSalary === netSalary) {
      // in the edge case, for larger negative net income, the gross salary can be negative -> we return 0 instead
      return Math.max(grossSalary, 0)
    }
  } else {
    grossSalary = calculateGrossSalaryWithRules(netSalary, rates, {
      isTaxHighRate: true,
    })

    verification = calculateNetSalary(grossSalary, rates, { isRoundingEnabled: false })

    if (verification.netSalary === netSalary) {
      return grossSalary
    }

    grossSalary = calculateGrossSalaryWithRules(netSalary, rates, {
      isTaxHighRate: true,
      isSocialMaxBase: true,
    })

    verification = calculateNetSalary(grossSalary, rates, { isRoundingEnabled: false })

    if (verification.netSalary === netSalary) {
      return grossSalary
    }
  }

  return 0
}

export default calculateGrossSalary
