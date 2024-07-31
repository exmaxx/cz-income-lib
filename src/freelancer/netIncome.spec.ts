import calculateNetIncome from './netIncome'
import { Expenses, Rates } from './freelancer.types'

describe('calculator of net income and insurance', () => {
  const AVG_SALARY = 40324

  // For 2023
  const rates: Rates = {
    incomeRates: {
      rate: 0.15, // 15%
      credit: 30840,
      nonTaxable: 0,
    },
    healthRates: {
      basePercentage: 0.5, // 50%
      minBase: 20162 * 12, // 241944; 20162 CZK per month
      rate: 0.135, // 13.5%
    },
    socialRates: {
      basePercentage: 0.5, // 50%
      minBase: AVG_SALARY * 0.25 * 12, // = 120 972; 25% of average salary per month
      maxBase: AVG_SALARY * 48, // = 1 935 552; 48-times average salary
      rate: 0.292, // 29.2% = 28% (retirement) + 1.2% (unemployment)
    },
  }

  const income = 1000000

  describe('expenses as flat-rate', () => {
    it('calculates net income and other values', () => {
      const expenses: Expenses = {
        percentage: 0.6, // 60%
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

    it('works with higher tax rate for high income', () => {
      // TODO: 48-times the average salary per year, then add 23% tax
    })
  })

  describe('expenses as real amount', () => {
    it('sets income tax to zero if calculated as negative', () => {
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

    it('sets social assessment base to minimum if below threshold', () => {
      const expenses: Expenses = {
        amount: 900000,
      }

      const { socialAssessmentBase } = calculateNetIncome(income, expenses, rates)

      expect(socialAssessmentBase).toEqual(rates.socialRates.minBase)
    })

    // same for social max base
    it('sets social assessment base to maximum if above threshold', () => {
      const expenses: Expenses = {
        amount: 0,
      }

      const { socialAssessmentBase } = calculateNetIncome(4000000, expenses, rates)

      expect(socialAssessmentBase).toEqual(rates.socialRates.maxBase)
    })

    it('sets health assessment base to minimum if below threshold', () => {
      const expenses: Expenses = {
        amount: 900000,
      }

      const { healthAssessmentBase } = calculateNetIncome(income, expenses, rates)

      expect(healthAssessmentBase).toEqual(rates.healthRates.minBase)
    })

    it('works with higher tax rate for high income', () => {
      // TODO: 48-times the average salary per year, then add 23% tax
    })
  })
})
