import { rates } from '../../fixtures'
import { ThresholdKey, Thresholds } from '../../enums'
import { Expenses } from '../../types'
import NetIncomeCalculator from '../NetIncomeCalculator'
import { ThresholdsChecker } from './ThresholdsChecker'
import { deepCloneSimple } from '../../../utils'
import PercentageExpensesWrapper from '../../expenses/PercentageExpensesWrapper'
import FixedExpensesWrapper from '../../expenses/FixedExpensesWrapper'

describe('ThresholdsChecker', () => {
  const income = 1000000
  const highGrossIncome = 20000000

  const netIncomeCalculator = new NetIncomeCalculator(rates)
  const thresholdsChecker = new ThresholdsChecker(rates)

  describe('check()', () => {
    describe('flat-rate expenses', () => {
      const expenses: Expenses = {
        percentage: 0.4, // 40%
      }

      const percentageExpensesWrapper = new PercentageExpensesWrapper(expenses.percentage)

      it('detects maximum flat rate, high tax and maximum base social for high income', () => {
        // Arrange
        const netIncomeResults = netIncomeCalculator.calculate(highGrossIncome, percentageExpensesWrapper)

        // Act
        const reachedThresholds = thresholdsChecker.check(highGrossIncome, netIncomeResults, expenses)

        // Assert
        const expectedThresholds: ThresholdKey[] = [
          Thresholds.MAX_BASE_SOCIAL,
          Thresholds.HIGH_TAX,
          Thresholds.MAX_FLAT_RATE,
        ].sort()

        // TODO: Use `isSubsetOf`?
        const sortedThresholds = Array.from(reachedThresholds).sort()

        expect(sortedThresholds).toEqual(expectedThresholds)
      })
    })

    describe('expenses as real amount', () => {
      it('detects zero tax base', () => {
        // Arrange
        const expenses: Expenses = {
          amount: 950000,
        }

        const ratesWithNonTaxable = deepCloneSimple(rates)

        ratesWithNonTaxable.incomeRates.nonTaxable = 1000000

        const netIncomeCalculatorWithNonTaxable = new NetIncomeCalculator(ratesWithNonTaxable)
        const thresholdsCheckerWithNonTaxable = new ThresholdsChecker(ratesWithNonTaxable)
        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const netIncomeResults = netIncomeCalculatorWithNonTaxable.calculate(income, fixedExpensesWrapper)

        // Act
        const reachedThresholds = thresholdsCheckerWithNonTaxable.check(income, netIncomeResults, expenses)

        // Assert
        expect(reachedThresholds.has(Thresholds.ZERO_TAX_BASE)).toBe(true)
      })

      it('detects zero tax', () => {
        // Arrange
        const expenses: Expenses = {
          amount: 800000,
        }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const netIncomeResults = netIncomeCalculator.calculate(income, fixedExpensesWrapper)

        // Act
        const reachedThresholds = thresholdsChecker.check(income, netIncomeResults, expenses)

        // Assert
        expect(reachedThresholds.has(Thresholds.ZERO_TAX)).toBe(true)
      })

      it('detects minimum base social', () => {
        // Arrange
        const expenses: Expenses = {
          amount: 900000,
        }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const netIncomeResults = netIncomeCalculator.calculate(income, fixedExpensesWrapper)

        // Act
        const reachedThresholds = thresholdsChecker.check(income, netIncomeResults, expenses)

        // Assert
        expect(reachedThresholds.has(Thresholds.MIN_BASE_SOCIAL)).toBe(true)
      })

      it('detects maximum base social', () => {
        // Arrange
        const expenses: Expenses = {
          amount: 0,
        }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const netIncomeResults = netIncomeCalculator.calculate(highGrossIncome, fixedExpensesWrapper)

        // Act
        const reachedThresholds = thresholdsChecker.check(highGrossIncome, netIncomeResults, expenses)

        // Assert
        expect(reachedThresholds.has(Thresholds.MAX_BASE_SOCIAL)).toBe(true)
      })

      it('detects minimum base health', () => {
        // Arrange
        const expenses: Expenses = {
          amount: 900000,
        }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const netIncomeResults = netIncomeCalculator.calculate(income, fixedExpensesWrapper)

        // Act
        const reachedThresholds = thresholdsChecker.check(income, netIncomeResults, expenses)

        // Assert
        expect(reachedThresholds.has(Thresholds.MIN_BASE_HEALTH)).toBe(true)
      })

      it('detects high tax and maximum base social', () => {
        // Arrange
        const expenses: Expenses = {
          amount: 3000000,
        }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        const netIncomeResults = netIncomeCalculator.calculate(highGrossIncome, fixedExpensesWrapper)

        // Act
        const reachedThresholds = thresholdsChecker.check(highGrossIncome, netIncomeResults, expenses)

        // Assert
        const expectedThresholds: ThresholdKey[] = [Thresholds.HIGH_TAX, Thresholds.MAX_BASE_SOCIAL]

        // TODO: Use `isSubsetOf`?
        const sortedThresholds = Array.from(reachedThresholds).sort()

        expect(sortedThresholds).toEqual(expectedThresholds)
      })
    })
  })
})
