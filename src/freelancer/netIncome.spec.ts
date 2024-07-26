import calculateNetIncome from './netIncome'
import { Expenses, Rates } from './freelancer.types'

describe('calculator of net income and insurance', () => {
  // For 2023
  const rates: Rates = {
    incomeRates: {
      rate: 0.15, // 15%
      credit: 30840,
      nonTaxable: 0,
    },
    healthRates: {
      basePercentage: 0.5, // 50%
      minBase: 20162 * 12, // 20162 CZK per month
      rate: 0.135, // 13.5%
    },
    socialRates: {
      basePercentage: 0.5, // 50%
      minBase: 10081 * 12, // 10081 CZK per month
      maxBase: 1935552, // 48-times average salary
      rate: 0.292, // 29.2% = 28% (retirement) + 1.2% (unemployment)
    },
  }

  const income = 1000000

  describe('expenses as flat-rate', () => {
    it('calculates net income and other values', () => {
      const expenses: Expenses = {
        rate: 0.6, // 60%
      }

      expect(calculateNetIncome(income, expenses, rates)).toEqual({
        health: 32663,
        healthAssessmentBase: 241944,
        incomeTax: 29160,
        incomeTaxBase: 400000,
        netIncome: 879777,
        social: 58400,
        socialAssessmentBase: 200000,
      })
    })
  })

  describe('expenses as real amount', () => {
    it('calculates net income and other values', () => {
      const expenses: Expenses = {
        amount: 500000,
      }

      const result = calculateNetIncome(income, expenses, rates)

      expect(result).toEqual({
        health: 33750,
        healthAssessmentBase: 250000,
        incomeTax: 44160,
        incomeTaxBase: 500000,
        netIncome: 349090,
        social: 73000,
        socialAssessmentBase: 250000,
      })
    })

    it('calculates income tax as zero when negative', () => {
      const expenses: Expenses = {
        amount: 800000,
      }

      const { incomeTax } = calculateNetIncome(income, expenses, rates)

      expect(incomeTax).toEqual(0)
    })
  })
})
