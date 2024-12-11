import calculateNetIncome from './netIncome'
import { Expenses } from '../types'
import { rates } from '../fixtures'
import { MAX_FLAT_RATE_AMOUNT } from '../constants'

describe('calculator of net income and insurance', () => {
  const income = 1000000
  const highIncome = 10000000

  describe('expenses as flat-rate', () => {
    const expenses: Expenses = {
      // TODO: Iterate over all possible percentages.
      percentage: 0.4, // 40%
    }

    it('calculates net income and other values', () => {
      expect(calculateNetIncome(income, expenses, rates)).toEqual({
        health: 40500,
        healthAssessmentBase: 300000,
        incomeTax: 59160,
        incomeTaxBase: 600000,
        incomeTaxWithHighRate: 0,
        incomeTaxWithLowRate: 90000,
        netIncome: 812740,
        social: 87600,
        socialAssessmentBase: 300000,
        reachedThresholds: [],
      })
    })

    it('works with higher tax rate for high income', () => {
      const { rate, credit, nonTaxable, highRate, highRateThreshold } = rates.incomeRates

      const maxFlatRateAmount = MAX_FLAT_RATE_AMOUNT * expenses.percentage

      const taxBase = highIncome - maxFlatRateAmount - nonTaxable
      const highTaxAmount = Math.max(0, taxBase - highRateThreshold)
      const lowTaxAmount = taxBase - highTaxAmount

      const expectedIncomeTax = Math.ceil(lowTaxAmount * rate + highTaxAmount * highRate - credit)

      const { incomeTax, incomeTaxWithLowRate, incomeTaxWithHighRate, reachedThresholds } =
        calculateNetIncome(highIncome, expenses, rates)

      expect(incomeTax).toEqual(expectedIncomeTax)
      expect(incomeTaxWithLowRate).toEqual(lowTaxAmount * rate)
      expect(incomeTaxWithHighRate).toEqual(highTaxAmount * highRate)

      expect(reachedThresholds).toEqual(
        expect.arrayContaining(['MAX_FLAT_RATE', 'HIGH_TAX', 'MAX_BASE_SOCIAL'])
      )
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
      const expenses: Expenses = {
        amount: 500000,
      }

      const netIncomeDetails = calculateNetIncome(income, expenses, rates)

      expect(netIncomeDetails).toEqual({
        health: 33750,
        healthAssessmentBase: 250000,
        incomeTax: 44160,
        incomeTaxBase: 500000,
        incomeTaxWithHighRate: 0,
        incomeTaxWithLowRate: 75000,
        netIncome: 349090,
        reachedThresholds: [],
        social: 73000,
        socialAssessmentBase: 250000,
      })
    })

    it('calculates income tax as zero when negative', () => {
      const expenses: Expenses = {
        amount: 800000,
      }

      const { incomeTax, reachedThresholds } = calculateNetIncome(income, expenses, rates)

      expect(incomeTax).toEqual(0)
      expect(reachedThresholds).toContain('ZERO_TAX')
    })

    it('sets social assessment base to minimum if below threshold', () => {
      const expenses: Expenses = {
        amount: 900000,
      }

      const { socialAssessmentBase, reachedThresholds } = calculateNetIncome(
        income,
        expenses,
        rates
      )

      expect(socialAssessmentBase).toEqual(rates.socialRates.minBase)
      expect(reachedThresholds).toContain('MIN_BASE_SOCIAL')
    })

    // same for social max base
    it('sets social assessment base to maximum if above threshold', () => {
      const expenses: Expenses = {
        amount: 0,
      }

      const { socialAssessmentBase, reachedThresholds } = calculateNetIncome(
        4000000,
        expenses,
        rates
      )

      expect(socialAssessmentBase).toEqual(rates.socialRates.maxBase)
      expect(reachedThresholds).toContain('MAX_BASE_SOCIAL')
    })

    it('sets health assessment base to minimum if below threshold', () => {
      const expenses: Expenses = {
        amount: 900000,
      }

      const { healthAssessmentBase, reachedThresholds } = calculateNetIncome(
        income,
        expenses,
        rates
      )

      expect(healthAssessmentBase).toEqual(rates.healthRates.minBase)
      expect(reachedThresholds).toContain('MIN_BASE_HEALTH')
    })

    it('works with higher tax rate for high income', () => {
      const { rate, credit, nonTaxable, highRate, highRateThreshold } = rates.incomeRates

      const expenses: Expenses = {
        amount: 3000000,
      }

      const taxBase = highIncome - expenses.amount - nonTaxable
      const highTaxAmount = Math.max(0, taxBase - highRateThreshold)
      const lowTaxAmount = taxBase - highTaxAmount

      const expectedIncomeTax = Math.ceil(lowTaxAmount * rate + highTaxAmount * highRate - credit)

      const { incomeTax, incomeTaxWithLowRate, incomeTaxWithHighRate, reachedThresholds } =
        calculateNetIncome(highIncome, expenses, rates)

      expect(incomeTax).toEqual(expectedIncomeTax)
      expect(incomeTaxWithLowRate).toEqual(lowTaxAmount * rate)
      expect(incomeTaxWithHighRate).toEqual(highTaxAmount * highRate)

      expect(reachedThresholds).toEqual(expect.arrayContaining(['HIGH_TAX', 'MAX_BASE_SOCIAL']))
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

        expect(() => calculateNetIncome(income, expenses, rates)).toThrow()
      })

      it('throws does not throw when expenses zero', () => {
        const expenses: Expenses = {
          amount: 0,
        }

        expect(() => calculateNetIncome(income, expenses, rates)).not.toThrow()
      })

      it('throws does not throw when expenses positive', () => {
        const expenses: Expenses = {
          amount: 1,
        }

        expect(() => calculateNetIncome(income, expenses, rates)).not.toThrow()
      })
    })
  })
})
