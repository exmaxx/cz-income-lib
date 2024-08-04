import calculateGrossIncome from './grossIncome'
import calculateNetIncome from './netIncome'
import { AVG_SALARY_MONTHLY } from './constants'
import { isAlmostEqual } from '../utils'

function calculateGrossSalaryVerified(netSalary, rates) {
  let grossSalary = calculateGrossIncome(netSalary, rates)
  let verification = calculateNetIncome(grossSalary, rates)

  if (verification.netSalary === netSalary) {
    return grossSalary
  }

  const avgSalaryYearly = AVG_SALARY_MONTHLY * 12

  if (netSalary < avgSalaryYearly) {
    grossSalary = calculateGrossIncome(netSalary, rates, {
      isMinHealthForced: true,
    })

    verification = calculateNetIncome(grossSalary, rates)

    if (verification.netSalary === netSalary) {
      return grossSalary
    }

    grossSalary = calculateGrossIncome(netSalary, rates, {
      isMinHealthForced: true,
      isTaxZero: true,
    })

    verification = calculateNetIncome(grossSalary, rates)

    if (verification.netSalary === netSalary) {
      // in the edge case, for larger negative net income, the gross salary can be negative -> we return 0 instead
      return Math.max(grossSalary, 0)
    }
  } else {
    grossSalary = calculateGrossIncome(netSalary, rates, {
      isTaxHighRate: true,
    })

    verification = calculateNetIncome(grossSalary, rates)

    if (isAlmostEqual(verification.netSalary, netSalary)) {
      return grossSalary
    }

    // if (verification.netSalary === netSalary) {
    //   return grossSalary
    // }

    grossSalary = calculateGrossIncome(netSalary, rates, {
      isTaxHighRate: true,
      isSocialMaxBase: true,
    })

    verification = calculateNetIncome(grossSalary, rates)

    if (isAlmostEqual(verification.netSalary, netSalary)) {
      // if (verification.netSalary === netSalary) {
      return grossSalary
    }
  }

  throw new Error('Unable to calculate gross salary (all approximations failed)')
}

export default calculateGrossSalaryVerified
