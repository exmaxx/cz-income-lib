import calculateGrossSalaryWithRules from './grossSalaryWithRules'
import calculateNetSalary from '../net-salary/netSalary'
import { AVG_SALARY_MONTHLY } from '../constants'
import { Rates } from '../types'
import { areTechnicallyEqual } from '../../utils'

function calculateGrossSalary(netSalary: number, rates: Rates): number {
  if (netSalary < -rates.healthRates.minAmount) {
    // in case net salary would be lower than the amount of health insurance, the gross salary would be below 0,
    // which is not something we work with, therefore we return 0
    return 0
  }

  let grossSalary = calculateGrossSalaryWithRules(netSalary, rates)
  let verification = calculateNetSalary(grossSalary, rates, { isRoundingEnabled: false })

  if (areTechnicallyEqual(verification.netSalary, netSalary)) {
    return grossSalary
  }

  const avgSalaryYearly = AVG_SALARY_MONTHLY * 12

  if (netSalary < avgSalaryYearly) {
    grossSalary = calculateGrossSalaryWithRules(netSalary, rates, {
      isMinHealthUsed: true,
    })

    verification = calculateNetSalary(grossSalary, rates, { isRoundingEnabled: false })

    if (areTechnicallyEqual(verification.netSalary, netSalary)) {
      return grossSalary
    }

    grossSalary = calculateGrossSalaryWithRules(netSalary, rates, {
      isMinHealthUsed: true,
      isTaxZero: true,
    })

    verification = calculateNetSalary(grossSalary, rates, { isRoundingEnabled: false })

    if (areTechnicallyEqual(verification.netSalary, netSalary)) {
      return grossSalary
    }
  } else {
    grossSalary = calculateGrossSalaryWithRules(netSalary, rates, {
      isTaxHighRate: true,
    })

    verification = calculateNetSalary(grossSalary, rates, { isRoundingEnabled: false })

    if (areTechnicallyEqual(verification.netSalary, netSalary)) {
      return grossSalary
    }

    grossSalary = calculateGrossSalaryWithRules(netSalary, rates, {
      isTaxHighRate: true,
      isSocialMaxBase: true,
    })

    verification = calculateNetSalary(grossSalary, rates, { isRoundingEnabled: false })

    if (areTechnicallyEqual(verification.netSalary, netSalary)) {
      return grossSalary
    }
  }

  throw new Error('Unable to calculate gross salary')
}

export default calculateGrossSalary
