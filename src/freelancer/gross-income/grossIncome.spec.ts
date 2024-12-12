import calculateGrossIncome from './grossIncome'
import calculateNetIncome from '../net-income/netIncome'
import { rates } from '../fixtures'
import { Expenses } from '../types'
import { Rates } from '../rates'
describe('expenses as a flat rate percentage', () => {
  it.each([
    { netIncome: 1200000, description: 'medium income' }, // 100 000 CZK / month
    { netIncome: 8000000, description: 'high income' }, // 666 667 CZK / month
    { netIncome: 300000, description: 'low income' }, // 25 000 CZK / month
  ])('finishes for integer net income - for $description', ({ netIncome }) => {
    const expenses: Expenses = {
      percentage: 0.6,
    }

    for (
      let netIncomeIterated = netIncome;
      netIncomeIterated < netIncome + 5;
      netIncomeIterated++
    ) {
      expect(() => calculateGrossIncome(netIncomeIterated, expenses, rates)).not.toThrow()
    }
  })

  describe.each([
    { grossIncome: 0 },
    { grossIncome: 600000 }, // 50 000 CZK / month
    { grossIncome: 1200000 }, // 100 000 CZK / month
    { grossIncome: 2000000 }, // 166 667 CZK / month
    { grossIncome: 2600000 }, // 216 667 CZK / month
    { grossIncome: 10000000 }, // 833 333 CZK / month
  ])('gross income $grossIncome', ({ grossIncome }) => {
    it('calculates gross income from net income (30% rate)', () => {
      const expenses: Expenses = {
        percentage: 0.3,
      }

      const { netIncome } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(calculateGrossIncome(netIncome, expenses, rates)).toBeCloseTo(grossIncome, 5)
    })

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
    const { minDeductions } = rates

    it.each([{ percentage: 0.3 }, { percentage: 0.4 }, { percentage: 0.6 }, { percentage: 0.8 }])(
      'returns minimal deductions for a zero net income ($percentage rate)',
      ({ percentage }) => {
        expect(calculateGrossIncome(0, { percentage }, rates)).toEqual(minDeductions)
      }
    )
  })

  describe('negative net income', () => {
    const { minDeductions } = rates

    it.each([{ percentage: 0.3 }, { percentage: 0.4 }, { percentage: 0.6 }, { percentage: 0.8 }])(
      'returns 0 for a net income equal to negative minimal deductions ($percentage rate)',
      ({ percentage }) => {
        expect(calculateGrossIncome(-minDeductions, { percentage }, rates)).toEqual(0)
      }
    )

    it.each([{ percentage: 0.3 }, { percentage: 0.4 }, { percentage: 0.6 }, { percentage: 0.8 }])(
      'still returns 0, even when net income is below to negative minimal deductions ($percentage rate)',
      ({ percentage }) => {
        expect(calculateGrossIncome(-minDeductions - 1, { percentage }, rates)).toEqual(0)
      }
    )
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
    { grossIncome: 300000 },
    { grossIncome: 500000 },
    { grossIncome: 1000000 },
    { grossIncome: 2600000 },
    { grossIncome: 10000000 },
  ])('for gross income $grossIncome', ({ grossIncome }) => {
    it('calculates gross income from net income', () => {
      const expenses = { amount: grossIncome * 0.5 }

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

      const { netIncome, incomeTax } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      expect(incomeTax).toBe(0)

      const result = calculateGrossIncome(netIncome, expenses, rates)

      expect(result).toEqual(grossIncome)
    })
  })

  describe('zero gross income', () => {
    const { minDeductions } = rates

    it('returns 0 for a net income equal to minimal deductions', () => {
      expect(calculateGrossIncome(-minDeductions, { amount: 0 }, rates)).toEqual(0)
      expect(calculateGrossIncome(-minDeductions, { amount: 500000 }, rates)).toEqual(500000)
    })

    it('still returns 0 for a net income below minimal deductions', () => {
      expect(calculateGrossIncome(-minDeductions - 1, { amount: 0 }, rates)).toEqual(0)
      expect(calculateGrossIncome(-minDeductions - 1, { amount: 500000 }, rates)).toEqual(500000)
    })
  })

  describe('bad configuration', () => {
    it('throws exception when no result', () => {
      const incorrectRates = new Rates(
        { ...rates.incomeRates, credit: 1000000 },
        rates.socialRates,
        rates.healthRates
      )

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
