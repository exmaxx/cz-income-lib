import calculate from './freelancer'
import { Expenses, Rates } from './freelancer.types'

describe('freelancer', () => {
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

  describe('calculation of income and insurance', () => {
    it('accepts expenses as flat-rate', () => {
      const expenses: Expenses = {
        rate: 0.6, // 60%
      }

      expect(calculate(income, expenses, rates)).toEqual({
        health: 32663,
        healthAssessmentBase: 241944,
        incomeTax: 29160,
        incomeTaxBase: 400000,
        social: 58400,
        socialAssessmentBase: 200000,
      })
    })

    it('accepts expenses as real amount', () => {
      const expenses: Expenses = {
        amount: 400000,
      }

      expect(calculate(income, expenses, rates)).toEqual({
        health: 40500,
        healthAssessmentBase: 300000,
        incomeTax: 59160,
        incomeTaxBase: 600000,
        social: 87600,
        socialAssessmentBase: 300000,
      })
    })
  })
})
