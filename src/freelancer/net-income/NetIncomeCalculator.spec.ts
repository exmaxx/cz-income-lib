import { Expenses } from '../types'
import { rates } from '../fixtures'
import { MAX_FLAT_RATE_INCOME } from '../constants'
import { NetIncomeResults } from './types'
import NetIncomeCalculator from './NetIncomeCalculator'
import PercentageExpensesWrapper from '../expenses/PercentageExpensesWrapper'
import FixedExpensesWrapper from '../expenses/FixedExpensesWrapper'

describe('calculator of net income and insurance', () => {
  const income = 1000000
  const highIncome = 10000000

  const calculator = new NetIncomeCalculator(rates)

  describe('expenses as flat-rate', () => {
    const expenses: Expenses = {
      // TODO: Iterate over all possible percentages.
      percentage: 0.4, // 40%
    }

    // TODO: Keep only this and remove `expenses`?
    const percentageExpensesWrapper = new PercentageExpensesWrapper(expenses.percentage)

    it('calculates net income and other values', () => {
      // Arrange
      const expectedResult: NetIncomeResults = {
        highRateTaxBase: 0,
        lowRateTaxBase: 600000,
        health: 40500,
        healthAssessmentBase: 300000,
        incomeTax: 59160,
        incomeTaxBase: 600000,
        highRateIncomeTax: 0,
        lowRateIncomeTax: 90000,
        netIncome: 812740,
        profit: 600000,
        social: 87600,
        socialAssessmentBase: 300000,
        taxableProfit: 600000,
      }

      // Act
      const result = calculator.calculate(income, percentageExpensesWrapper)

      // Assert
      expect(result).toStrictEqual<NetIncomeResults>(expectedResult)
    })

    it('works with higher tax rate for high income', () => {
      const { rate, credit, nonTaxable, highRate, highRateThreshold } = rates.incomeRates

      const maxFlatRateAmount = MAX_FLAT_RATE_INCOME * expenses.percentage

      const taxBase = highIncome - maxFlatRateAmount - nonTaxable
      const highTaxAmount = Math.max(0, taxBase - highRateThreshold)
      const lowTaxAmount = taxBase - highTaxAmount

      const expectedIncomeTax = Math.ceil(lowTaxAmount * rate + highTaxAmount * highRate - credit)

      const { incomeTax, lowRateIncomeTax, highRateIncomeTax } = calculator.calculate(
        highIncome,
        percentageExpensesWrapper
      )

      expect(incomeTax).toBe(expectedIncomeTax)
      expect(lowRateIncomeTax).toBe(lowTaxAmount * rate)
      expect(highRateIncomeTax).toBe(highTaxAmount * highRate)
    })

    xit('works when below zero', () => {
      // TODO: Implement this test.
    })

    xit('works even when minimal deductions', () => {
      // Normally, we would limit this value to minimal deductions. But we need even lower values
      // so that the gross calculation can work.
      // TODO: Implement this test.
    })
  })

  describe('expenses as real amount', () => {
    it('calculates net income and other values', () => {
      // Arrange
      const expenses: Expenses = {
        amount: 500000,
      }

      const expectedResult: NetIncomeResults = {
        highRateTaxBase: 0,
        lowRateTaxBase: 500000,
        health: 33750,
        healthAssessmentBase: 250000,
        incomeTax: 44160,
        incomeTaxBase: 500000,
        highRateIncomeTax: 0,
        lowRateIncomeTax: 75000,
        netIncome: 349090,
        profit: 500000,
        social: 73000,
        socialAssessmentBase: 250000,
        taxableProfit: 500000,
      }

      const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

      // Act
      const netIncomeDetails = calculator.calculate(income, fixedExpensesWrapper)

      // Assert
      expect(netIncomeDetails).toStrictEqual<NetIncomeResults>(expectedResult)
    })

    it('calculates income tax as zero when negative', () => {
      const expenses: Expenses = {
        amount: 800000,
      }

      const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

      const { incomeTax } = calculator.calculate(income, fixedExpensesWrapper)

      expect(incomeTax).toBe(0)
    })

    it('sets social assessment base to minimum if below threshold', () => {
      const expenses: Expenses = {
        amount: 900000,
      }

      const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

      const { socialAssessmentBase } = calculator.calculate(income, fixedExpensesWrapper)

      expect(socialAssessmentBase).toBe(rates.socialRates.minBase)
    })

    // same for social max base
    it('sets social assessment base to maximum if above threshold', () => {
      const expenses: Expenses = {
        amount: 0,
      }

      const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

      const { socialAssessmentBase } = calculator.calculate(4000000, fixedExpensesWrapper)

      expect(socialAssessmentBase).toBe(rates.socialRates.maxBase)
    })

    it('sets health assessment base to minimum if below threshold', () => {
      const expenses: Expenses = {
        amount: 900000,
      }

      const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

      const { healthAssessmentBase } = calculator.calculate(income, fixedExpensesWrapper)

      expect(healthAssessmentBase).toBe(rates.healthRates.minBase)
    })

    it('works with higher tax rate for high income', () => {
      const { rate, credit, nonTaxable, highRate, highRateThreshold } = rates.incomeRates

      const expenses: Expenses = {
        amount: 3000000,
      }

      const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

      const taxBase = highIncome - expenses.amount - nonTaxable
      const highTaxAmount = Math.max(0, taxBase - highRateThreshold)
      const lowTaxAmount = taxBase - highTaxAmount

      const expectedIncomeTax = Math.ceil(lowTaxAmount * rate + highTaxAmount * highRate - credit)

      const { incomeTax, lowRateIncomeTax, highRateIncomeTax } = calculator.calculate(highIncome, fixedExpensesWrapper)

      expect(incomeTax).toBe(expectedIncomeTax)
      expect(lowRateIncomeTax).toBe(lowTaxAmount * rate)
      expect(highRateIncomeTax).toBe(highTaxAmount * highRate)
    })

    xit('works when net income below zero', () => {
      // TODO: Implement this test.
    })

    xit('works even when minimal deductions', () => {
      // Normally, we would limit this value to minimal deductions. But we need even lower values
      // so that the gross calculation can work.
      // TODO: Implement this test.
    })

    describe('exceptions', () => {
      it('throws exception when expenses negative', () => {
        const expenses: Expenses = {
          amount: -1,
        }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        expect(() => calculator.calculate(income, fixedExpensesWrapper)).toThrow()
      })

      it('throws does not throw when expenses zero', () => {
        const expenses: Expenses = {
          amount: 0,
        }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        expect(() => calculator.calculate(income, fixedExpensesWrapper)).not.toThrow()
      })

      it('throws does not throw when expenses positive', () => {
        const expenses: Expenses = {
          amount: 1,
        }

        const fixedExpensesWrapper = new FixedExpensesWrapper(expenses.amount)

        expect(() => calculator.calculate(income, fixedExpensesWrapper)).not.toThrow()
      })
    })
  })
})
