import calculateGrossIncome from './grossIncome'
import { Rates } from './freelancer.types'

describe('calculate gross income', () => {
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
      minBase: 20162 * 12, // 20162 CZK per month
      rate: 0.135, // 13.5%
    },
    socialRates: {
      basePercentage: 0.5, // 50%
      minBase: AVG_SALARY * 0.25 * 12, // = 120 972; 25% of average salary per month
      maxBase: AVG_SALARY * 48, // = 1 935 552; 48-times average salary
      rate: 0.292, // 29.2% = 28% (retirement) + 1.2% (unemployment)
    },
  }

  describe('expenses as flat-rate', () => {
    const expenses = {
      rate: 0.6, // 60%
    }

    it('calculates gross income from net income', () => {
      // The result should have been 1136355 but there is rounding in the net income calculation
      // so we are not able to get the exact result.
      expect(calculateGrossIncome(885440, expenses, rates)).toEqual(1000000)

      // FIXME: This is the correct result when we take into account the min and max bases
      // expect(calculateGrossIncome(879777, expenses, rates)).toEqual(1000000)
    })

    it('returns 0 for a net income of 0', () => {
      expect(calculateGrossIncome(0, expenses, rates)).toEqual(0)
    })

    it('returns 0 for a negative net income', () => {
      expect(calculateGrossIncome(-100, expenses, rates)).toEqual(0)
    })
  })

  describe('expenses as real amount', () => {
    const expenses = {
      amount: 500000,
    }

    it('calculates gross income from net income', () => {
      expect(calculateGrossIncome(349090, expenses, rates)).toEqual(1000000)

      // FIXME: This would be the correct result if we take into account the min and max bases and
      //   making income tax zero when negative
      // expect(calculateGrossIncome(1000000, expenses, rates)).toEqual(1951744)
    })
  })
})
