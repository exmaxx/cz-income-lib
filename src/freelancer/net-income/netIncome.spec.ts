import calculateNetIncome from './netIncome'
import { Expenses } from '../types'
import { rates } from '../fixtures'
import { MAX_FLAT_RATE_AMOUNT } from '../constants'

describe('calculator of net income and insurance', () => {
  const income = 1000000
  const highIncome = 10000000

  describe('expenses as flat-rate', () => {
    const expenses: Expenses = {
      percentage: 0.4, // 60%
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
        thresholds: [],
      })
    })

    it('works with higher tax rate for high income', () => {
      const { rate, credit, nonTaxable, highRate, highRateThreshold } = rates.incomeRates

      const maxFlatRateAmount = MAX_FLAT_RATE_AMOUNT * expenses.percentage

      const taxBase = highIncome - maxFlatRateAmount - nonTaxable
      const highTaxAmount = Math.max(0, taxBase - highRateThreshold)
      const lowTaxAmount = taxBase - highTaxAmount

      const expectedIncomeTax = Math.ceil(lowTaxAmount * rate + highTaxAmount * highRate - credit)

      const { incomeTax, incomeTaxWithLowRate, incomeTaxWithHighRate, thresholds } =
        calculateNetIncome(highIncome, expenses, rates)

      expect(incomeTax).toEqual(expectedIncomeTax)
      expect(incomeTaxWithLowRate).toEqual(lowTaxAmount * rate)
      expect(incomeTaxWithHighRate).toEqual(highTaxAmount * highRate)

      expect(thresholds).toEqual(
        expect.arrayContaining(['MAX_FLAT_RATE', 'HIGH_TAX', 'MAX_BASE_SOCIAL'])
      )
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
        social: 73000,
        socialAssessmentBase: 250000,
        thresholds: [],
      })
    })

    it('calculates income tax as zero when negative', () => {
      const expenses: Expenses = {
        amount: 800000,
      }

      const { incomeTax, thresholds } = calculateNetIncome(income, expenses, rates)

      expect(incomeTax).toEqual(0)
      expect(thresholds).toContain('ZERO_TAX')
    })

    it('sets social assessment base to minimum if below threshold', () => {
      const expenses: Expenses = {
        amount: 900000,
      }

      const { socialAssessmentBase, thresholds } = calculateNetIncome(income, expenses, rates)

      expect(socialAssessmentBase).toEqual(rates.socialRates.minBase)
      expect(thresholds).toContain('MIN_BASE_SOCIAL')
    })

    // same for social max base
    it('sets social assessment base to maximum if above threshold', () => {
      const expenses: Expenses = {
        amount: 0,
      }

      const { socialAssessmentBase, thresholds } = calculateNetIncome(4000000, expenses, rates)

      expect(socialAssessmentBase).toEqual(rates.socialRates.maxBase)
      expect(thresholds).toContain('MAX_BASE_SOCIAL')
    })

    it('sets health assessment base to minimum if below threshold', () => {
      const expenses: Expenses = {
        amount: 900000,
      }

      const { healthAssessmentBase, thresholds } = calculateNetIncome(income, expenses, rates)

      expect(healthAssessmentBase).toEqual(rates.healthRates.minBase)
      expect(thresholds).toContain('MIN_BASE_HEALTH')
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

      const { incomeTax, incomeTaxWithLowRate, incomeTaxWithHighRate, thresholds } =
        calculateNetIncome(highIncome, expenses, rates)

      expect(incomeTax).toEqual(expectedIncomeTax)
      expect(incomeTaxWithLowRate).toEqual(lowTaxAmount * rate)
      expect(incomeTaxWithHighRate).toEqual(highTaxAmount * highRate)

      expect(thresholds).toEqual(expect.arrayContaining(['HIGH_TAX', 'MAX_BASE_SOCIAL']))
    })
  })
})
