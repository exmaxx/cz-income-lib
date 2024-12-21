import { rates } from '../fixtures'
import { Expenses, Rates } from '../types'
import GrossIncomeCalculator from './GrossIncomeCalculator'
import NetIncomeCalculator from '../net-income/NetIncomeCalculator'
import PercentageExpensesWrapper from '../expenses/PercentageExpensesWrapper'
import FixedExpensesWrapper from '../expenses/FixedExpensesWrapper'

const minDeductions =
  rates.healthRates.minBase * rates.healthRates.rate +
  rates.socialRates.minBase * rates.socialRates.rate

const calculator = new GrossIncomeCalculator(rates)
const netCalculator = new NetIncomeCalculator(rates)

describe('expenses as a flat rate percentage', () => {
  it.each([
    { netIncome: 1200000, description: 'medium income' }, // 100 000 CZK / month
    { netIncome: 8000000, description: 'high income' }, // 666 667 CZK / month
    { netIncome: 300000, description: 'low income' }, // 25 000 CZK / month
  ])('finishes for integer net income - for $description', ({ netIncome }) => {
    const expenses: Expenses = {
      percentage: 0.6,
    }

    const percentageExpensesWrapper = new PercentageExpensesWrapper(expenses.percentage)

    for (
      let netIncomeIterated = netIncome;
      netIncomeIterated < netIncome + 5;
      netIncomeIterated++
    ) {
      expect(() => calculator.calculate(netIncomeIterated, percentageExpensesWrapper)).not.toThrow()
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

      const percentageExpensesWrapper = new PercentageExpensesWrapper(expenses.percentage)

      const { netIncome } = netCalculator.calculate(grossIncome, percentageExpensesWrapper, {
        isRoundingEnabled: false,
      })

      expect(calculator.calculate(netIncome, percentageExpensesWrapper)).toBeCloseTo(grossIncome, 5)
    })

    it('calculates gross income from net income (40% rate)', () => {
      const expenses: Expenses = {
        percentage: 0.4,
      }

      const percentageExpensesWrapper = new PercentageExpensesWrapper(expenses.percentage)

      const { netIncome } = netCalculator.calculate(grossIncome, percentageExpensesWrapper, {
        isRoundingEnabled: false,
      })

      expect(calculator.calculate(netIncome, percentageExpensesWrapper)).toBeCloseTo(grossIncome, 5)
    })

    it('calculates gross income from net income (60% rate)', () => {
      const expenses: Expenses = {
        percentage: 0.6,
      }

      const percentageExpensesWrapper = new PercentageExpensesWrapper(expenses.percentage)

      const { netIncome } = netCalculator.calculate(grossIncome, percentageExpensesWrapper, {
        isRoundingEnabled: false,
      })

      expect(calculator.calculate(netIncome, percentageExpensesWrapper)).toBeCloseTo(grossIncome, 5)
    })
  })

  describe('zero net income', () => {
    it.each([{ percentage: 0.3 }, { percentage: 0.4 }, { percentage: 0.6 }, { percentage: 0.8 }])(
      'returns minimal deductions for a zero net income ($percentage rate)',
      ({ percentage }) => {
        const percentageExpensesWrapper = new PercentageExpensesWrapper(percentage)

        expect(calculator.calculate(0, percentageExpensesWrapper)).toEqual(minDeductions)
      }
    )
  })

  describe('negative net income', () => {
    it.each([{ percentage: 0.3 }, { percentage: 0.4 }, { percentage: 0.6 }, { percentage: 0.8 }])(
      'returns 0 for a net income equal to negative minimal deductions ($percentage rate)',
      ({ percentage }) => {
        const percentageExpensesWrapper = new PercentageExpensesWrapper(percentage)

        expect(calculator.calculate(-minDeductions, percentageExpensesWrapper)).toEqual(0)
      }
    )

    it.each([{ percentage: 0.3 }, { percentage: 0.4 }, { percentage: 0.6 }, { percentage: 0.8 }])(
      'still returns 0, even when net income is below to negative minimal deductions ($percentage rate)',
      ({ percentage }) => {
        const percentageExpensesWrapper = new PercentageExpensesWrapper(percentage)

        expect(calculator.calculate(-minDeductions - 1, percentageExpensesWrapper)).toEqual(0)
      }
    )
  })
})

describe('expenses as real amount', () => {
  it('finishes for consecutive net income values (covers cases that have decimal intermediate result)', () => {
    // medium income
    const fixedExpensesWrapperMedium = new FixedExpensesWrapper(500000)

    for (let netIncomeIterated = 1200000; netIncomeIterated < 1200005; netIncomeIterated++) {
      expect(() =>
        calculator.calculate(netIncomeIterated, fixedExpensesWrapperMedium)
      ).not.toThrow()
    }

    // high income
    const fixedExpensesWrapperHigh = new FixedExpensesWrapper(3000000)

    for (let netIncomeIterated = 8000000; netIncomeIterated < 8000005; netIncomeIterated++) {
      expect(() => calculator.calculate(netIncomeIterated, fixedExpensesWrapperHigh)).not.toThrow()
    }

    // low income
    const fixedExpensesWrapperLow = new FixedExpensesWrapper(100000)

    for (let netIncomeIterated = 300000; netIncomeIterated < 300005; netIncomeIterated++) {
      expect(() => calculator.calculate(netIncomeIterated, fixedExpensesWrapperLow)).not.toThrow()
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

      const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

      const { netIncome } = netCalculator.calculate(grossIncome, fixedExpensesWrapper, {
        isRoundingEnabled: false,
      })

      const result = calculator.calculate(netIncome, fixedExpensesWrapper)

      expect(result).toBeCloseTo(grossIncome, 5)
    })

    it('works when minimal base for health insurance is reached', () => {
      const expenses: Expenses = {
        amount: grossIncome - 300000,
      }

      const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

      const { netIncome, healthAssessmentBase } = netCalculator.calculate(
        grossIncome,
        fixedExpensesWrapper,
        {
          isRoundingEnabled: false,
        }
      )

      expect(healthAssessmentBase).toEqual(rates.healthRates.minBase)

      const result = calculator.calculate(netIncome, fixedExpensesWrapper)

      expect(result).toBeCloseTo(grossIncome, 5)
    })

    it('works when minimal base for social insurance is reached', () => {
      const expenses: Expenses = {
        amount: grossIncome - 220000,
      }

      const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

      const { netIncome, socialAssessmentBase } = netCalculator.calculate(
        grossIncome,
        fixedExpensesWrapper,
        {
          isRoundingEnabled: false,
        }
      )

      expect(socialAssessmentBase).toEqual(rates.socialRates.minBase)

      const result = calculator.calculate(netIncome, fixedExpensesWrapper)

      expect(result).toBeCloseTo(grossIncome, 5)
    })

    it('works when zero income tax is reached', () => {
      const expenses: Expenses = {
        amount: grossIncome - 200000,
      }

      const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

      const { netIncome, incomeTax } = netCalculator.calculate(grossIncome, fixedExpensesWrapper, {
        isRoundingEnabled: false,
      })

      expect(incomeTax).toBe(0)

      const result = calculator.calculate(netIncome, fixedExpensesWrapper)

      expect(result).toEqual(grossIncome)
    })
  })

  describe('zero gross income', () => {
    it('returns 0 for a net income equal to minimal deductions', () => {
      const fixedExpensesWrapperZero = new FixedExpensesWrapper(0)
      expect(calculator.calculate(-minDeductions, fixedExpensesWrapperZero)).toEqual(0)

      const fixedExpensesWrapper = new FixedExpensesWrapper(500000)
      expect(calculator.calculate(-minDeductions, fixedExpensesWrapper)).toEqual(500000)
    })

    it('still returns 0 for a net income below minimal deductions', () => {
      const fixedExpensesWrapperZero = new FixedExpensesWrapper(0)
      expect(calculator.calculate(-minDeductions - 1, fixedExpensesWrapperZero)).toEqual(0)

      const fixedExpensesWrapper = new FixedExpensesWrapper(500000)
      expect(calculator.calculate(-minDeductions - 1, fixedExpensesWrapper)).toEqual(500000)
    })
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

    const calculator = new GrossIncomeCalculator(incorrectRates)

    const fixedExpensesWrapper = new FixedExpensesWrapper(500000)

    expect(() => calculator.calculate(349090, fixedExpensesWrapper)).toThrow()
  })
})

// Only use this for thorough testing. It takes half an hour to run.
xdescribe('carpet bombing', () => {
  it('successfully returns a value (no throw)', () => {
    for (let i = 0; i < 20000000; i++) {
      const percentageExpensesWrapper = new PercentageExpensesWrapper(0.6)
      expect(() => calculator.calculate(i, percentageExpensesWrapper)).not.toThrow()

      const fixedExpensesWrapper = new FixedExpensesWrapper(500000)
      expect(() => calculator.calculate(i, fixedExpensesWrapper)).not.toThrow()
    }
  })
})
