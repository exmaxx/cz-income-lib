import calculateGrossIncome from './grossIncome'
import calculateNetIncome from '../net-income/netIncome'
import { rates } from '../fixtures'
import { Expenses, Rates } from '../types'

describe('expenses as a flat rate percentage', () => {
  it('finishes for integer net income', () => {
    const expenses: Expenses = {
      percentage: 0.6,
    }

    // medium income
    for (let netIncomeIterated = 1200000; netIncomeIterated < 1200005; netIncomeIterated++) {
      expect(() => calculateGrossIncome(netIncomeIterated, expenses, rates)).not.toThrow()
    }

    // high income
    for (let netIncomeIterated = 8000000; netIncomeIterated < 8000005; netIncomeIterated++) {
      expect(() => calculateGrossIncome(netIncomeIterated, expenses, rates)).not.toThrow()
    }

    // low income
    for (let netIncomeIterated = 300000; netIncomeIterated < 300005; netIncomeIterated++) {
      expect(() => calculateGrossIncome(netIncomeIterated, expenses, rates)).not.toThrow()
    }
  })

  describe.each([
    { grossIncome: 0 },
    { grossIncome: 1000000 },
    { grossIncome: 2000000 },
    { grossIncome: 2600000 },
    { grossIncome: 10000000 },
  ])('gross income $grossIncome', ({ grossIncome }) => {
    it('calculates gross income from net income (40% rate)', () => {
      const expenses: Expenses = {
        percentage: 0.4,
      }

      const { netIncome } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(calculateGrossIncome(netIncome, expenses, rates)).toBeCloseTo(grossIncome, 5)
    })

    it('calculates gross income from net income (60% rate)', () => {
      const expenses: Expenses = {
        percentage: 0.6,
      }

      const { netIncome } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(calculateGrossIncome(netIncome, expenses, rates)).toBeCloseTo(grossIncome, 5)
    })
  })

  describe('zero net income', () => {
    it('returns 0 for a net income of 0', () => {
      expect(calculateGrossIncome(0, { percentage: 0.4 }, rates)).toEqual(0)
      expect(calculateGrossIncome(0, { percentage: 0.6 }, rates)).toEqual(0)
      expect(calculateGrossIncome(0, { percentage: 0.8 }, rates)).toEqual(0)
    })
  })

  describe('negative net income', () => {
    it('returns 0 for a negative net income', () => {
      expect(calculateGrossIncome(-1000, { percentage: 0.4 }, rates)).toEqual(0)
      expect(calculateGrossIncome(-1000, { percentage: 0.6 }, rates)).toEqual(0)
      expect(calculateGrossIncome(-1000, { percentage: 0.8 }, rates)).toEqual(0)
    })
  })
})

describe('expenses as real amount', () => {
  it('finishes for consecutive net income values (covers cases that have decimal intermediate result)', () => {
    // medium income
    for (let netIncomeIterated = 1200000; netIncomeIterated < 1200005; netIncomeIterated++) {
      expect(() => calculateGrossIncome(netIncomeIterated, { amount: 500000 }, rates)).not.toThrow()
    }

    // high income
    for (let netIncomeIterated = 8000000; netIncomeIterated < 8000005; netIncomeIterated++) {
      expect(() =>
        calculateGrossIncome(netIncomeIterated, { amount: 3000000 }, rates)
      ).not.toThrow()
    }

    // low income
    for (let netIncomeIterated = 300000; netIncomeIterated < 300005; netIncomeIterated++) {
      expect(() => calculateGrossIncome(netIncomeIterated, { amount: 100000 }, rates)).not.toThrow()
    }
  })

  describe.each([
    { grossIncome: 0 },
    // { grossIncome: 120000 }, // FIXME: Does not pass tests.
    { grossIncome: 1000000 },
    { grossIncome: 1000000 },
    { grossIncome: 2600000 },
    { grossIncome: 10000000 },
  ])('for gross income $grossIncome', ({ grossIncome }) => {
    it('calculates gross income from net income', () => {
      const expenses = { amount: 500000 }

      const { netIncome } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      const result = calculateGrossIncome(netIncome, expenses, rates)

      expect(result).toBeCloseTo(grossIncome, 5)
    })

    it('works when minimal base for health insurance is reached', () => {
      const expenses: Expenses = {
        amount: grossIncome - 300000,
      }

      const { netIncome, healthAssessmentBase } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(healthAssessmentBase).toEqual(rates.healthRates.minBase)

      const result = calculateGrossIncome(netIncome, expenses, rates)

      expect(result).toBeCloseTo(grossIncome, 5)
    })

    it('works when minimal base for social insurance is reached', () => {
      const expenses: Expenses = {
        amount: grossIncome - 220000,
      }

      const { netIncome, socialAssessmentBase } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(socialAssessmentBase).toEqual(rates.socialRates.minBase)

      const result = calculateGrossIncome(netIncome, expenses, rates)

      expect(result).toBeCloseTo(grossIncome, 5)
    })

    it('works when zero income tax is reached', () => {
      const expenses: Expenses = {
        amount: grossIncome - 200000,
      }

      const { netIncome, incomeTax } = calculateNetIncome(
        grossIncome,
        expenses,
        rates,
        {
          isRoundingEnabled: false,
        }
      )

      expect(incomeTax).toBe(0)

      const result = calculateGrossIncome(netIncome, expenses, rates)

      expect(result).toEqual(grossIncome)
    })
  })

  describe('zero net income', () => {
    it('returns 0 for a net income of 0', () => {
      expect(calculateGrossIncome(0, { amount: 0 }, rates)).toEqual(0)
      expect(calculateGrossIncome(0, { amount: 500000 }, rates)).toEqual(0)
    })
  })

  describe('negative net income', () => {
    it('returns 0 for a negative net income', () => {
      expect(calculateGrossIncome(-1000, { amount: 0 }, rates)).toEqual(0)
      expect(calculateGrossIncome(-1000, { amount: 500000 }, rates)).toEqual(0)
    })
  })

  describe('negative expenses', () => {
    it('throws exception for negative expenses', () => {
      expect(() => calculateGrossIncome(100000, { amount: -500000 }, rates)).toThrow()
    })
  })

  describe('bad configuration', () => {
    it('throws exception when no result', () => {
      const incorrectRates: Rates = {
        ...rates,
        incomeRates: {
          ...rates.incomeRates,
          credit: 1000000,
        },
      }

      expect(() => calculateGrossIncome(349090, { amount: 500000 }, incorrectRates)).toThrow()
    })
  })
})

// Only use this for thorough testing. It takes half an hour to run.
xdescribe('carpet bombing', () => {
  it('successfully returns a value (no throw)', () => {
    for (let i = 0; i < 20000000; i++) {
      expect(() => calculateGrossIncome(i, { percentage: 0.6 }, rates)).not.toThrow()
      expect(() => calculateGrossIncome(i, { amount: 500000 }, rates)).not.toThrow()
    }
  })
})
