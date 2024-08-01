import calculateGrossIncomeVerified from './grossIncomeVerified'
import calculateNetIncome from './netIncome'
import { isAlmostEqual } from '../utils'
import { rates } from './freelancer.fixtures'
import { Expenses } from './freelancer.types'

describe('calculate gross income', () => {
  const grossIncome = 1000000

  it('returns 0 for a net income of 0', () => {
    expect(calculateGrossIncomeVerified(0, { percentage: 0.6 }, rates)).toEqual(0)
    expect(calculateGrossIncomeVerified(0, { amount: 500000 }, rates)).toEqual(0)
  })

  it('returns 0 for a negative net income', () => {
    expect(calculateGrossIncomeVerified(-1000, { percentage: 0.6 }, rates)).toEqual(0)
    expect(calculateGrossIncomeVerified(-1000, { amount: 500000 }, rates)).toEqual(0)
  })

  describe('expenses as flat-rate percentage', () => {
    it('calculates gross income from net income', () => {
      expect(calculateGrossIncomeVerified(812740, { percentage: 0.4 }, rates)).toEqual(grossIncome)
      expect(calculateGrossIncomeVerified(879778, { percentage: 0.6 }, rates)).toEqual(grossIncome)
    })
  })

  describe('expenses as real amount', () => {
    it('calculates gross income from net income', () => {
      expect(calculateGrossIncomeVerified(349090, { amount: 500000 }, rates)).toEqual(grossIncome)
    })

    it('works when minimal base for health insurance is reached', () => {
      const expenses: Expenses = {
        amount: 700000,
      }

      const { netIncome, healthAssessmentBase } = calculateNetIncome(grossIncome, expenses, rates)

      expect(healthAssessmentBase).toEqual(rates.healthRates.minBase)

      const result = calculateGrossIncomeVerified(netIncome, expenses, rates)

      expect(isAlmostEqual(result, grossIncome)).toBe(true)
    })

    it('works when minimal base for social insurance is reached', () => {
      const expenses: Expenses = {
        amount: 780000,
      }

      const { netIncome, socialAssessmentBase } = calculateNetIncome(grossIncome, expenses, rates)

      expect(socialAssessmentBase).toEqual(rates.socialRates.minBase)

      const result = calculateGrossIncomeVerified(netIncome, expenses, rates)

      expect(isAlmostEqual(result, grossIncome)).toBe(true)
    })

    it('works when zero income tax is reached', () => {
      const expenses: Expenses = {
        amount: 800000,
      }

      const { netIncome, incomeTax } = calculateNetIncome(grossIncome, expenses, rates)

      expect(incomeTax).toBe(0)

      const result = calculateGrossIncomeVerified(netIncome, expenses, rates)

      expect(isAlmostEqual(result, grossIncome)).toBe(true)
    })

    it('throws exception for negative expenses', () => {
      expect(() => calculateGrossIncomeVerified(100000, { amount: -500000 }, rates)).toThrow()
    })
  })
})
