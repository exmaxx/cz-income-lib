import {
  Expenses,
  HealthInsuranceRates,
  IncomeRates,
  NetIncomeCalculationOptions,
  NetIncomeResult,
  Rates,
  SocialInsuranceRates,
} from '../types'
import { MAX_FLAT_RATE_AMOUNT, Thresholds } from '../constants'

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

  const reachedThresholds: string[] = []

  if ('percentage' in expenses) {
    const percentage = expenses.percentage || 0
    const flatRateAmount = Math.min(income * percentage, MAX_FLAT_RATE_AMOUNT * percentage)

    if (flatRateAmount === MAX_FLAT_RATE_AMOUNT * percentage) {
      reachedThresholds.push(Thresholds.MAX_FLAT_RATE)
    }

    profit = income - flatRateAmount
  } else {
    profit = income - expenses.amount
  }

  const taxableProfit = profit - incomeRates.nonTaxable

  if (taxableProfit <= 0) {
    reachedThresholds.push(Thresholds.ZERO_TAX_BASE)

    return {
      incomeTaxBase: 0,
      reachedThresholds,
    }
  }

  return {
    incomeTaxBase: isRoundingEnabled ? roundDown(taxableProfit, 100) : taxableProfit,
    reachedThresholds,
  }
}

/**
 * Calculates the income tax based on the income tax base and the income rates.
 */
function calculateIncomeTax(
  taxBase: number,
  incomeRates: IncomeRates,
  options: NetIncomeCalculationOptions
) {
  const { credit, rate, highRate, highRateThreshold } = incomeRates
  const { isRoundingEnabled } = options

  const highTaxAmount = Math.max(0, taxBase - highRateThreshold)
  const lowTaxAmount = taxBase - highTaxAmount

  const incomeTaxWithHighRate = highTaxAmount * highRate
  const incomeTaxWithLowRate = lowTaxAmount * rate

  const incomeTax = incomeTaxWithLowRate + incomeTaxWithHighRate - credit

  const reachedThresholds: string[] = []

  if (highTaxAmount > 0) {
    reachedThresholds.push(Thresholds.HIGH_TAX)
  }

  if (incomeTax <= 0) {
    reachedThresholds.push(Thresholds.ZERO_TAX)

    return {
      incomeTax: 0,
      incomeTaxWithLowRate: 0,
      incomeTaxWithHighRate: 0,
      reachedThresholds,
    }
  }

  return {
    incomeTax: isRoundingEnabled ? Math.ceil(incomeTax) : incomeTax,
    incomeTaxWithLowRate,
    incomeTaxWithHighRate,
    reachedThresholds,
  }
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

  const reachedThresholds: string[] = []

  if (socialAssessmentBase === socialRates.minBase) {
    reachedThresholds.push(Thresholds.MIN_BASE_SOCIAL)
  }

  socialAssessmentBase = Math.min(socialAssessmentBase, socialRates.maxBase)

  if (socialAssessmentBase === socialRates.maxBase) {
    reachedThresholds.push(Thresholds.MAX_BASE_SOCIAL)
  }

  const social = socialAssessmentBase * socialRates.rate

  return {
    reachedThresholds,
    social: isRoundingEnabled ? Math.ceil(social) : social,
    socialAssessmentBase,
  }
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

  const reachedThresholds: string[] = []

  if (healthAssessmentBase === healthRates.minBase) {
    reachedThresholds.push(Thresholds.MIN_BASE_HEALTH)
  }

  const health = healthAssessmentBase * healthRates.rate

  return {
    healthAssessmentBase,
    health: isRoundingEnabled ? Math.ceil(health) : health,
    reachedThresholds,
  }
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
): NetIncomeResult {
  const { incomeRates, socialRates, healthRates } = rates

  const { incomeTaxBase, reachedThresholds: thresholdsTaxBase } = calculateIncomeTaxBase(
    expenses,
    grossIncome,
    incomeRates,
    options
  )

  const {
    incomeTax,
    incomeTaxWithLowRate,
    incomeTaxWithHighRate,
    reachedThresholds: thresholdsIncomeTax,
  } = calculateIncomeTax(incomeTaxBase, incomeRates, options)

  const {
    socialAssessmentBase,
    social,
    reachedThresholds: thresholdsSocial,
  } = calculateSocial(incomeTaxBase, socialRates, options)

  const {
    healthAssessmentBase,
    health,
    reachedThresholds: thresholdsHealth,
  } = calculateHealth(incomeTaxBase, healthRates, options)

  let netIncome = grossIncome - incomeTax - social - health

  if ('amount' in expenses) {
    if (expenses.amount) {
      netIncome -= expenses.amount
    }

    netIncome = Math.max(netIncome, 0)
  }

  return {
    health,
    healthAssessmentBase,
    incomeTax,
    incomeTaxBase,
    incomeTaxWithHighRate,
    incomeTaxWithLowRate,
    netIncome,
    reachedThresholds: [
      ...thresholdsTaxBase,
      ...thresholdsIncomeTax,
      ...thresholdsSocial,
      ...thresholdsHealth,
    ],
    social,
    socialAssessmentBase,
  }
}

export default calculateNetIncome
