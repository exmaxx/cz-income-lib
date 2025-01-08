import { rates } from '../fixtures'
import { HighThresholdKey, LowThresholdKey, Thresholds } from '../enums'
import GrossIncomeCalculatorWithThresholds from './GrossIncomeCalculatorWithThresholds'
import NetIncomeCalculator from '../net-income/NetIncomeCalculator'
import PercentageExpensesWrapper from '../expenses/PercentageExpensesWrapper'
import FixedExpensesWrapper from '../expenses/FixedExpensesWrapper'

describe('estimates gross income from net income', () => {
  const { HIGH_TAX, MAX_BASE_SOCIAL, MAX_FLAT_RATE, MIN_BASE_HEALTH, MIN_BASE_SOCIAL, ZERO_TAX } = Thresholds

  const income = 1000000
  const highIncome = 10000000

  const calculator = new GrossIncomeCalculatorWithThresholds(rates)
  const netCalculator = new NetIncomeCalculator(rates)

  describe('expenses as flat-rate percentage', () => {
    describe('medium income', () => {
      it.each([
        { percentage: 0.3, gross: income },
        { percentage: 0.4, gross: income },
        { percentage: 0.6, gross: income * 1.5 },
      ])('flat-rate: $percentage', ({ percentage, gross }) => {
        const expenses = { percentage }

        const percentageExpensesWrapper = new PercentageExpensesWrapper(expenses.percentage)

        const { netIncome } = netCalculator.calculate(gross, percentageExpensesWrapper, {
          isRoundingEnabled: false,
        })

        const result = calculator.calculate(netIncome, percentageExpensesWrapper)

        expect(result).toBeCloseTo(gross)
      })
    })

    describe('low income', () => {
      const minDeductions =
        rates.healthRates.minBase * rates.healthRates.rate + rates.socialRates.minBase * rates.socialRates.rate

      const lowThresholds: LowThresholdKey[] = [MIN_BASE_HEALTH, MIN_BASE_SOCIAL, ZERO_TAX]

      const percentageExpensesWrapper = new PercentageExpensesWrapper(0.6)

      it('returns gross income equal to min deductions for a net income of 0', () => {
        expect(calculator.calculate(0, percentageExpensesWrapper, lowThresholds)).toEqual(minDeductions)
      })

      // This is the case when gross income was zero but deductions needed to be paid -> negative net income
      it('returns 0 gross income for a net income equal to negative min deductions', () => {
        const result = calculator.calculate(-minDeductions, percentageExpensesWrapper, lowThresholds)

        expect(result).toEqual(0)
      })

      it('works for almost zero gross income (net income is negative)', () => {
        const { netIncome } = netCalculator.calculate(100, percentageExpensesWrapper, {
          isRoundingEnabled: false,
        })

        const result = calculator.calculate(netIncome, percentageExpensesWrapper, lowThresholds)

        expect(result).toEqual(100)
      })
    })

    describe('high income', () => {
      const highThresholds: HighThresholdKey[] = [HIGH_TAX, MAX_FLAT_RATE, MAX_BASE_SOCIAL]

      it.each([
        { percentage: 0.3, gross: highIncome },
        { percentage: 0.4, gross: highIncome },
        { percentage: 0.6, gross: highIncome },
        { percentage: 0.8, gross: highIncome },
      ])('flat-rate (high income): $percentage', ({ percentage, gross }) => {
        const expenses = { percentage }

        const percentageExpensesWrapper = new PercentageExpensesWrapper(expenses.percentage)

        const { netIncome } = netCalculator.calculate(gross, percentageExpensesWrapper, {
          isRoundingEnabled: false,
        })

        const result = calculator.calculate(netIncome, percentageExpensesWrapper, highThresholds)

        expect(result).toEqual(gross)
      })
    })
  })

  describe('expenses as real amount', () => {
    describe('medium income', () => {
      it('estimates gross income from net income', () => {
        const expenses = { amount: 500000 }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const { netIncome } = netCalculator.calculate(income, fixedExpensesWrapper, {
          isRoundingEnabled: false,
        })

        const result = calculator.calculate(netIncome, fixedExpensesWrapper)

        expect(result).toBeCloseTo(income)
      })
    })

    describe('low income', () => {
      it('works when minimal base for health insurance is reached', () => {
        const expenses = { amount: 700000 }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const { netIncome } = netCalculator.calculate(income, fixedExpensesWrapper, {
          isRoundingEnabled: false,
        })

        const thresholds = [MIN_BASE_HEALTH]

        const result = calculator.calculate(netIncome, fixedExpensesWrapper, thresholds)

        expect(result).toBeCloseTo(income)
      })

      it('works when minimal base for social insurance is reached', () => {
        const expenses = { amount: 780000 }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const { netIncome } = netCalculator.calculate(income, fixedExpensesWrapper, {
          isRoundingEnabled: false,
        })

        const thresholds = [
          // min. health base must be used because when social threshold is applied in the original net income calculation,
          // the health base must have already been applied also (health base is higher) - at least it holds for 2023 rates
          MIN_BASE_HEALTH,
          MIN_BASE_SOCIAL,
        ]

        const estimatedGrossIncome = calculator.calculate(netIncome, fixedExpensesWrapper, thresholds)

        expect(estimatedGrossIncome).toBeCloseTo(income)
      })

      it('works when zero income tax is reached', () => {
        const expenses = { amount: 800000 }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const { netIncome } = netCalculator.calculate(income, fixedExpensesWrapper, {
          isRoundingEnabled: false,
        })

        const thresholds = [
          // again, when zero tax option is used, the health and social base must be used as well
          MIN_BASE_HEALTH,
          MIN_BASE_SOCIAL,
          ZERO_TAX,
        ]

        const result = calculator.calculate(netIncome, fixedExpensesWrapper, thresholds)

        expect(result).toEqual(income)
      })
    })

    describe('high income', () => {
      it('works when high tax is reached', () => {
        const expenses = { amount: 8000000 }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const { netIncome } = netCalculator.calculate(highIncome, fixedExpensesWrapper, {
          isRoundingEnabled: false,
        })

        const thresholds = [HIGH_TAX]

        const result = calculator.calculate(netIncome, fixedExpensesWrapper, thresholds)

        expect(result).toEqual(highIncome)
      })

      it('works when maximal base for social insurance is reached', () => {
        const expenses = { amount: 6000000 }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const { netIncome } = netCalculator.calculate(highIncome, fixedExpensesWrapper, {
          isRoundingEnabled: false,
        })

        const thresholds = [HIGH_TAX, MAX_BASE_SOCIAL]

        const result = calculator.calculate(netIncome, fixedExpensesWrapper, thresholds)

        expect(result).toEqual(highIncome)
      })
    })
  })
})
