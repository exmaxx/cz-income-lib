import calculateGrossIncome from './grossSalary'
import calculateNetIncome from '../net-salary/netSalary'
import { AVG_SALARY_MONTHLY } from '../constants'
import { Rates } from '../types'

function calculateGrossSalaryVerified(netSalary: number, rates: Rates): number {
  let grossSalary = calculateGrossIncome(netSalary, rates)
  let verification = calculateNetIncome(grossSalary, rates, { isRoundingEnabled: false })

  if (verification.netSalary === netSalary) {
    return grossSalary
  }

  const avgSalaryYearly = AVG_SALARY_MONTHLY * 12

  if (netSalary < avgSalaryYearly) {
    grossSalary = calculateGrossIncome(netSalary, rates, {
      isMinHealthForced: true,
    })

    verification = calculateNetIncome(grossSalary, rates, { isRoundingEnabled: false })

    if (verification.netSalary === netSalary) {
      return grossSalary
    }

    grossSalary = calculateGrossIncome(netSalary, rates, {
      isMinHealthForced: true,
      isTaxZero: true,
    })

    verification = calculateNetIncome(grossSalary, rates, { isRoundingEnabled: false })

    if (verification.netSalary === netSalary) {
      // in the edge case, for larger negative net income, the gross salary can be negative -> we return 0 instead
      return Math.max(grossSalary, 0)
    }
  } else {
    grossSalary = calculateGrossIncome(netSalary, rates, {
      isTaxHighRate: true,
    })

    verification = calculateNetIncome(grossSalary, rates, { isRoundingEnabled: false })

    if (verification.netSalary === netSalary) {
      return grossSalary
    }

    grossSalary = calculateGrossIncome(netSalary, rates, {
      isTaxHighRate: true,
      isSocialMaxBase: true,
    })

    verification = calculateNetIncome(grossSalary, rates, { isRoundingEnabled: false })

    if (verification.netSalary === netSalary) {
      return grossSalary
    }
  }

  return 0
}

export default calculateGrossSalaryVerified
