import {
  Expenses,
  HealthInsuranceRates,
  IncomeRates,
  NetIncomeCalculationOptions,
  Rates,
  SocialInsuranceRates,
} from '../types'

/**
 * Rounds a number down to the nearest multiple of a given precision.
 */
function roundDown(value: number, precision: number) {
  return Math.floor(value / precision) * precision
}

/**
 * Calculates the income tax base based on the expenses and income rates.
 */
function calculateIncomeTaxBase(
  expenses: Expenses,
  income: number,
  incomeRates: IncomeRates,
  { isRoundingEnabled }: NetIncomeCalculationOptions
) {
  let profit: number

  if ('percentage' in expenses) {
    const percentage = expenses.percentage || 0

    profit = income * (1 - percentage)
  } else {
    profit = income - expenses.amount
  }

  const taxableProfit = profit - incomeRates.nonTaxable

  if (taxableProfit <= 0) {
    return 0
  }

  return isRoundingEnabled ? roundDown(taxableProfit, 100) : taxableProfit
}

/**
 * Calculates the income tax based on the income tax base and the income rates.
 */
function calculateIncomeTax(
  incomeTaxBase: number,
  incomeRates: IncomeRates,
  { isRoundingEnabled }: NetIncomeCalculationOptions
) {
  const incomeTax = incomeTaxBase * incomeRates.rate - incomeRates.credit

  if (incomeTax <= 0) {
    return 0
  }

  return isRoundingEnabled ? Math.ceil(incomeTax) : incomeTax
}

/**
 * Calculates the social insurance contributions based on the income tax base and the social rates.
 */
function calculateSocial(
  incomeTaxBase: number,
  socialRates: SocialInsuranceRates,
  { isRoundingEnabled }: NetIncomeCalculationOptions
) {
  let socialAssessmentBase = Math.max(
    incomeTaxBase * socialRates.basePercentage,
    socialRates.minBase
  )

  socialAssessmentBase = Math.min(socialAssessmentBase, socialRates.maxBase)

  const social = socialAssessmentBase * socialRates.rate

  return { socialAssessmentBase, social: isRoundingEnabled ? Math.ceil(social) : social }
}

/**
 * Calculates the health insurance contributions based on the income tax base and the health rates.
 */
function calculateHealth(
  incomeTaxBase: number,
  healthRates: HealthInsuranceRates,
  { isRoundingEnabled }: NetIncomeCalculationOptions
) {
  const healthAssessmentBase = Math.max(
    incomeTaxBase * healthRates.basePercentage,
    healthRates.minBase
  )

  const health = healthAssessmentBase * healthRates.rate

  return { healthAssessmentBase, health: isRoundingEnabled ? Math.ceil(health) : health }
}

/**
 * Calculates the tax and insurance contributions for a freelancer based on their income, expenses,
 * and applicable rates.
 *
 * @param grossIncome - The income of the freelancer
 * @param expenses - The expenses, represented either as a fixed amount or a flat-rate percentage
 *  of the income
 * @param rates - The rates for income tax, social insurance, and health insurance
 * @param options - Additional options for the calculation
 * @returns An object containing detailed calculations of taxes and insurance contributions
 */
function calculateNetIncome(
  grossIncome: number,
  expenses: Expenses,
  rates: Rates,
  options: NetIncomeCalculationOptions = { isRoundingEnabled: true }
) {
  const { incomeRates, socialRates, healthRates } = rates

  const incomeTaxBase = calculateIncomeTaxBase(expenses, grossIncome, incomeRates, options)
  const incomeTax = calculateIncomeTax(incomeTaxBase, incomeRates, options)
  const { socialAssessmentBase, social } = calculateSocial(incomeTaxBase, socialRates, options)
  const { healthAssessmentBase, health } = calculateHealth(incomeTaxBase, healthRates, options)

  let netIncome = grossIncome - incomeTax - social - health

  if ('amount' in expenses) {
    if (expenses.amount) {
      netIncome -= expenses.amount
    }

    // netIncome = netIncome
    netIncome = Math.max(netIncome, 0)
  }

  return {
    health,
    healthAssessmentBase,
    incomeTax,
    incomeTaxBase,
    netIncome,
    social,
    socialAssessmentBase,
  }
}

export default calculateNetIncome
