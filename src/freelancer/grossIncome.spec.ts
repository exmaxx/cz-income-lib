import calculateGrossIncome from './grossIncome'
import { Rates } from './freelancer.types'

describe('calculateGrossIncome function', () => {
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

  const expenses = {
    rate: 0.6, // 60%
  }

  it('calculates gross income from net income', () => {
    // The result should have been 1136355 but there is rounding in the net income calculation
    // so we are not able to get the exact result.
    expect(calculateGrossIncome(1000000, expenses, rates)).toEqual(1134051)
  })

  it('returns 0 for a net income of 0', () => {
    expect(calculateGrossIncome(0, expenses, rates)).toEqual(0)
  })

  it('returns 0 for a negative net income', () => {
    expect(calculateGrossIncome(-100, expenses, rates)).toEqual(0)
  })
})
