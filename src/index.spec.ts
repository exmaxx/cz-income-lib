import {
  calculateFreelancerNetIncome,
  calculateEmployeeNetSalary,
  calculateFreelancerGrossIncome,
  calculateEmployeeGrossSalary,
} from './index'
import { Expenses } from './freelancer/types'
import { rates as freelancerRates } from './freelancer/fixtures'
import { rates as employeeRates } from './employee/fixtures'

describe('exported functions', () => {
  describe('freelancer', () => {
    const grossIncome = 1000000
    const netIncome = 1000000

    const expenses: Expenses = {
      percentage: 0.6,
    }

    describe('calculateFreelancerNetIncome()', () => {
      const fn = calculateFreelancerNetIncome

      it('is properly exported from the lib', () => {
        expect(fn).toBeDefined()
        expect(typeof fn).toBe('function')
      })

      it('has 3 parameters', () => {
        expect(fn.length).toBe(3)
      })

      it('can be called', () => {
        const expenses: Expenses = {
          percentage: 0.6,
        }

        const result = fn(netIncome, expenses, freelancerRates)

        expect(result).toBeDefined()
      })

      it('throws when expenses do not contain neither percentage nor amount', () => {
        const wrongExpenses = {}

        // @ts-expect-error
        expect(() => fn(grossIncome, wrongExpenses, freelancerRates)).toThrow(
          'Expenses must have a property "percentage" or "amount"'
        )
      })
    })

    describe('calculateFreelancerGrossIncome()', () => {
      const fn = calculateFreelancerGrossIncome

      it('is properly exported from the lib', () => {
        expect(fn).toBeDefined()
        expect(typeof fn).toBe('function')
      })

      it('has 3 parameters', () => {
        expect(fn.length).toBe(3)
      })

      it('can be called', () => {
        const result = fn(grossIncome, expenses, freelancerRates)

        expect(result).toBeDefined()
      })

      it('throws when expenses do not contain neither percentage nor amount', () => {
        const wrongExpenses = {}

        // @ts-expect-error
        expect(() => fn(grossIncome, wrongExpenses, freelancerRates)).toThrow(
          'Expenses must have a property "percentage" or "amount"'
        )
      })
    })
  })

  describe('employee', () => {
    const grossSalary = 1000000
    const netSalary = 1000000

    describe('calculateEmployeeNetSalary()', () => {
      const fn = calculateEmployeeNetSalary

      it('is properly exported from the lib', () => {
        expect(fn).toBeDefined()
        expect(typeof fn).toBe('function')
      })

      it('has 2 parameters', () => {
        expect(fn.length).toBe(2)
      })

      it('can be called', () => {
        const result = fn(grossSalary, employeeRates)

        expect(result).toBeDefined()
      })
    })

    describe('calculateEmployeeGrossSalary()', () => {
      const fn = calculateEmployeeGrossSalary

      it('exports a function', () => {
        expect(fn).toBeDefined()
        expect(typeof fn).toBe('function')
      })

      it('has 2 parameters', () => {
        expect(fn.length).toBe(2)
      })

      it('can be called', () => {
        const result = fn(netSalary, employeeRates)

        expect(result).toBeDefined()
      })
    })
  })
})
