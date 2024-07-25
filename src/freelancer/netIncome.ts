import {
  Expenses,
  HealthInsuranceRates,
  IncomeRates,
  Rates,
  SocialInsuranceRates,
} from './freelancer.types'

/**
 * Rounds a number down to the nearest multiple of a given precision.
 */
function roundDown(value: number, precision: number) {
  return Math.floor(value / precision) * precision
}

/**
 * Calculates the income tax base based on the expenses and income rates.
 */
function calculateIncomeTaxBase(expenses: Expenses, income: number, incomeRates: IncomeRates) {
  let profit: number

  if ('rate' in expenses) {
    profit = income * (1 - expenses.rate)
  } else {
    profit = income - expenses.amount
  }

  return Math.max(roundDown(profit - incomeRates.nonTaxable, 100), 0)
}

/**
 * Calculates the income tax based on the income tax base and the income rates.
 */
function calculateIncomeTax(incomeTaxBase: number, incomeRates: IncomeRates) {
  return Math.max(Math.ceil(incomeTaxBase * incomeRates.rate - incomeRates.credit), 0)
}

/**
 * Calculates the social insurance contributions based on the income tax base and the social rates.
 */
function calculateSocial(incomeTaxBase: number, socialRates: SocialInsuranceRates) {
  const socialAssessmentBase = Math.max(
    incomeTaxBase * socialRates.basePercentage,
    socialRates.minBase
  )

  const social = Math.min(Math.ceil(socialAssessmentBase * socialRates.rate), socialRates.maxBase)

  return { socialAssessmentBase, social }
}

/**
 * Calculates the health insurance contributions based on the income tax base and the health rates.
 */
function calculateHealth(incomeTaxBase: number, healthRates: HealthInsuranceRates) {
  const healthAssessmentBase = Math.max(
    incomeTaxBase * healthRates.basePercentage,
    healthRates.minBase
  )

  const health = Math.ceil(healthAssessmentBase * healthRates.rate)

  return { healthAssessmentBase, health }
}

/**
 * Calculates the tax and insurance contributions for a freelancer based on their income, expenses,
 * and applicable rates.
 *
 * @param grossIncome - The income of the freelancer
 * @param expenses - The expenses, represented either as a fixed amount or a flat-rate percentage
 *  of the income
 * @param rates - The rates for income tax, social insurance, and health insurance
 * @returns An object containing detailed calculations of taxes and insurance contributions
 */
function calculateNetIncome(grossIncome: number, expenses: Expenses, rates: Rates) {
  const { incomeRates, socialRates, healthRates } = rates

  const incomeTaxBase = calculateIncomeTaxBase(expenses, grossIncome, incomeRates)
  const incomeTax = calculateIncomeTax(incomeTaxBase, incomeRates)
  const { socialAssessmentBase, social } = calculateSocial(incomeTaxBase, socialRates)
  const { healthAssessmentBase, health } = calculateHealth(incomeTaxBase, healthRates)

  let netIncome = grossIncome - incomeTax - social - health

  if ('amount' in expenses) {
    netIncome -= expenses.amount
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
