import { HealthInsuranceRates, IncomeRates, Rates, SocialInsuranceRates } from '../types'

interface Rules {
  /** When true, the minimal health insurance is covered by the employee */
  isMinHealthUsed?: boolean
  /** When true, the tax is zero */
  isTaxZero?: boolean
  /** When true, we reached the higher tax rate */
  isTaxHighRate?: boolean
  /** When true, we reached the maximal social insurance limit */
  isSocialMaxBase?: boolean
}

function getTaxRates(incomeRates: IncomeRates, rules: Rules) {
  const { isTaxHighRate, isTaxZero } = rules

  if (isTaxZero) {
    return 0
  } else if (isTaxHighRate) {
    return incomeRates.highRate
  } else {
    return incomeRates.rate
  }
}

function getHealthRates(healthRates: HealthInsuranceRates, rules: Rules) {
  const { isMinHealthUsed } = rules

  let employeeRate = healthRates.employeeRate
  let employerRate = 0

  if (isMinHealthUsed) {
    employeeRate = 0
    employerRate = healthRates.employerRate
  }

  return employeeRate - employerRate
}

function getSocialRates(socialRates: SocialInsuranceRates, rules: Rules) {
  const { isSocialMaxBase } = rules

  return isSocialMaxBase ? 0 : socialRates.employeeRate
}

function getRatesCombined(rates: Rates, rules: Rules) {
  const { incomeRates, socialRates, healthRates } = rates

  return (
    getTaxRates(incomeRates, rules) +
    getSocialRates(socialRates, rules) +
    getHealthRates(healthRates, rules)
  )
}

function getTaxAdjustments(rules: Rules, incomeRates: IncomeRates) {
  const { highRateThreshold } = incomeRates
  let tax = 0

  if (rules.isTaxHighRate) {
    tax = highRateThreshold * incomeRates.highRate - highRateThreshold * incomeRates.rate
  }

  if (!rules.isTaxZero) {
    tax += incomeRates.credit
  }

  return tax
}

function getHealthAdjustments(rules: Rules, healthRates: HealthInsuranceRates) {
  return rules.isMinHealthUsed ? healthRates.minAmount : 0
}

function getSocialAdjustments(rules: Rules, socialRates: SocialInsuranceRates) {
  const { maxBase } = socialRates

  return rules.isSocialMaxBase ? maxBase * socialRates.employeeRate : 0
}

function calculateGrossSalaryWithRules(netSalary: number, rates: Rates, rules: Rules = {}) {
  const { incomeRates, socialRates, healthRates } = rates

  const top =
    netSalary -
    getTaxAdjustments(rules, incomeRates) +
    getHealthAdjustments(rules, healthRates) +
    getSocialAdjustments(rules, socialRates)

  const bottom = 1 - getRatesCombined(rates, rules)

  // TODO: Update this to use grossIncomeAdjustment and grossIncomeMultiple as well?
  const grossSalary = top / bottom

  return grossSalary
}

export default calculateGrossSalaryWithRules
