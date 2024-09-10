import calculateGrossIncomeVerified from './grossIncomeVerified'
import calculateNetIncome from '../net-income/netIncome'
import { rates } from '../fixtures'
import { Expenses } from '../types'
describe('low income', () => {
  it('returns 0 for a net income of 0', () => {
    expect(calculateGrossIncomeVerified(0, { percentage: 0.6 }, rates)).toEqual(0)
    expect(calculateGrossIncomeVerified(0, { amount: 500000 }, rates)).toEqual(0)
  })

  it('returns 0 for a negative net income', () => {
    expect(calculateGrossIncomeVerified(-1000, { percentage: 0.6 }, rates)).toEqual(0)
    expect(calculateGrossIncomeVerified(-1000, { amount: 500000 }, rates)).toEqual(0)
  })
})

describe.each([
  // { grossIncome: 1000000, title: 'normal income' },
  { grossIncome: 10000000, title: 'high income' },
])('calculate gross income - $title', ({ grossIncome }) => {
  describe('expenses as flat-rate percentage', () => {
    it('calculates gross income from net income (40% rate)', () => {
      const expenses: Expenses = {
        percentage: 0.4,
      }

      const { netIncome } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(calculateGrossIncomeVerified(netIncome, expenses, rates)).toBeCloseTo(grossIncome, 5)
    })

    it('calculates gross income from net income (60% rate)', () => {
      const expenses: Expenses = {
        percentage: 0.6,
      }

      const { netIncome } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(calculateGrossIncomeVerified(netIncome, expenses, rates)).toBeCloseTo(grossIncome, 5)
    })
  })

  describe('expenses as real amount', () => {
    it('calculates gross income from net income', () => {
      const expenses = { amount: 500000 }

      const { netIncome } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(calculateGrossIncomeVerified(netIncome, expenses, rates)).toEqual(grossIncome)
    })

    it('works when minimal base for health insurance is reached', () => {
      const expenses: Expenses = {
        amount: grossIncome - 300000,
      }

      const { netIncome, healthAssessmentBase } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(healthAssessmentBase).toEqual(rates.healthRates.minBase)

      const result = calculateGrossIncomeVerified(netIncome, expenses, rates)

      expect(result).toBeCloseTo(grossIncome)
    })

    it('works when minimal base for social insurance is reached', () => {
      const expenses: Expenses = {
        amount: grossIncome - 220000,
      }

      const { netIncome, socialAssessmentBase } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(socialAssessmentBase).toEqual(rates.socialRates.minBase)

      const result = calculateGrossIncomeVerified(netIncome, expenses, rates)

      expect(result).toEqual(grossIncome)
    })

    it('works when zero income tax is reached', () => {
      const expenses: Expenses = {
        amount: grossIncome - 200000,
      }

      const { netIncome, incomeTax } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(incomeTax).toBe(0)

      const result = calculateGrossIncomeVerified(netIncome, expenses, rates)

      // expect(isAlmostEqual(result, grossIncome)).toBe(true)
      expect(result).toEqual(grossIncome)
    })

    it('throws exception for negative expenses', () => {
      expect(() => calculateGrossIncomeVerified(100000, { amount: -500000 }, rates)).toThrow()
    })

    it('throws exception when no result', () => {
      const incorrectRates = { ...rates }

      incorrectRates.incomeRates.rate = 1

      expect(() =>
        calculateGrossIncomeVerified(349090, { amount: 500000 }, incorrectRates)
      ).toThrow()
    })
  })
})
