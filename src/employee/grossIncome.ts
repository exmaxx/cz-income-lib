import { HealthInsuranceRates, IncomeRates, Rates, SocialInsuranceRates } from './employee.types'

interface Options {
  /** When true, the minimal health insurance is covered by the employee */
  isMinHealthForced?: boolean
  /** When true, the tax is zero */
  isTaxZero?: boolean
  /** When true, we reached the higher tax rate */
  isTaxHighRate?: boolean
  /** When true, we reached the maximal social insurance limit */
  isSocialMaxBase?: boolean
}

function getTaxRates(incomeRates: IncomeRates, options: Options) {
  const { isTaxHighRate, isTaxZero } = options

  if (isTaxZero) {
    return 0
  } else if (isTaxHighRate) {
    return incomeRates.highRate
  } else {
    return incomeRates.rate
  }
}

function getHealthRates(healthRates: HealthInsuranceRates, options: Options) {
  const { isMinHealthForced } = options

  let employeeRate = healthRates.employeeRate
  let employerRate = 0

  if (isMinHealthForced) {
    employeeRate = 0
    employerRate = healthRates.employerRate
  }

  return employeeRate - employerRate
}

function getSocialRates(socialRates: SocialInsuranceRates, options: Options) {
  const { isSocialMaxBase } = options

  return isSocialMaxBase ? 0 : socialRates.employeeRate
}

function getRatesCombined(rates: Rates, options: Options) {
  const { incomeRates, socialRates, healthRates } = rates

  return (
    getTaxRates(incomeRates, options) +
    getSocialRates(socialRates, options) +
    getHealthRates(healthRates, options)
  )
}

function getTaxAdjustments(options: Options, monthlyHighRateThreshold: number, incomeRates: IncomeRates) {
  let tax = 0

  if (options.isTaxHighRate) {
    tax =
      monthlyHighRateThreshold * incomeRates.highRate - monthlyHighRateThreshold * incomeRates.rate
  }

  if (!options.isTaxZero) {
    tax += incomeRates.credit
  }

  return tax
}

function getHealthAdjustments(options: Options, healthRates: HealthInsuranceRates) {
  return options.isMinHealthForced ? healthRates.minAmount : 0
}

function getSocialAdjustments(options: Options, socialRates: SocialInsuranceRates) {
  const socialMonthlyMaxBase = socialRates.maxBase / 12

  return options.isSocialMaxBase ? socialMonthlyMaxBase * socialRates.employeeRate : 0
}

function calculateGrossIncome(netSalary: number, rates: Rates, options: Options = {}) {
  const { incomeRates, socialRates, healthRates } = rates
  const monthlyHighRateThreshold = incomeRates.highRateThreshold / 12

  const top =
    netSalary -
    getTaxAdjustments(options, monthlyHighRateThreshold, incomeRates) +
    getHealthAdjustments(options, healthRates) +
    getSocialAdjustments(options, socialRates)

  const bottom = 1 - getRatesCombined(rates, options)

  const grossSalary = top / bottom

  return Math.round(grossSalary)
}

export default calculateGrossIncome
