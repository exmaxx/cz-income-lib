import {
  calculateFreelancerNetIncome,
  calculateEmployeeNetSalary,
  calculateFreelancerGrossIncome,
  calculateEmployeeGrossSalary,
} from './index'
import { Expenses } from './freelancer/types'
import { rates as freelancerRates } from './freelancer/fixtures'
import { rates as employeeRates } from './employee/fixtures'
import { NetIncomeResults } from './freelancer/net-income/types'
import { NetSalaryResults } from './employee/net-salary/types'

describe('exported functions', () => {
  describe('freelancer', () => {
    const grossIncome = 1000000
    const netIncome = 1000000

    const expenses: Expenses = {
      percentage: 0.6,
    }

    describe('calculateFreelancerNetIncome()', () => {
      it('is properly exported from the lib', () => {
        expect(calculateFreelancerNetIncome).toBeDefined()
        expect(typeof calculateFreelancerNetIncome).toBe('function')
      })

      it('has 3 parameters', () => {
        expect(calculateFreelancerNetIncome.length).toBe(3)
      })

      it('can be called', () => {
        const expenses: Expenses = {
          percentage: 0.6,
        }

        const result = calculateFreelancerNetIncome(netIncome, expenses, freelancerRates)

        expect(result).toBeDefined()
      })

      it('throws when expenses do not contain neither percentage nor amount', () => {
        const wrongExpenses = {}

        // @ts-expect-error
        expect(() => calculateFreelancerNetIncome(grossIncome, wrongExpenses, freelancerRates)).toThrow(
          'Expenses must have a property "percentage" or "amount"'
        )
      })

      it('runs well', () => {
        // Arrange
        const expectedNetIncomeResults: NetIncomeResults = {
          health: 32663,
          healthAssessmentBase: 241944,
          highRateIncomeTax: 0,
          highRateTaxBase: 0,
          incomeTax: 29160,
          incomeTaxBase: 400000,
          lowRateIncomeTax: 60000,
          lowRateTaxBase: 400000,
          netIncome: 879777,
          profit: 400000,
          social: 58400,
          socialAssessmentBase: 200000,
          taxableProfit: 400000,
        }

        // Act
        const result = calculateFreelancerNetIncome(grossIncome, expenses, freelancerRates)

        // Assert
        expect(result).toStrictEqual<NetIncomeResults>(expectedNetIncomeResults)
      })
    })

    describe('calculateFreelancerGrossIncome()', () => {
      it('is properly exported from the lib', () => {
        expect(calculateFreelancerGrossIncome).toBeDefined()
        expect(typeof calculateFreelancerGrossIncome).toBe('function')
      })

      it('has 3 parameters', () => {
        expect(calculateFreelancerGrossIncome.length).toBe(3)
      })

      it('can be called', () => {
        const result = calculateFreelancerGrossIncome(grossIncome, expenses, freelancerRates)

        expect(result).toBeDefined()
      })

      it('throws when expenses do not contain neither percentage nor amount', () => {
        const wrongExpenses = {}

        // @ts-expect-error
        expect(() => calculateFreelancerGrossIncome(grossIncome, wrongExpenses, freelancerRates)).toThrow(
          'Expenses must have a property "percentage" or "amount"'
        )
      })

      it('runs well', () => {
        // Arrange
        const expectedGrossIncome = 1136368.4664246824

        // Act
        const result = calculateFreelancerGrossIncome(netIncome, expenses, freelancerRates)

        // Assert
        expect(result).toBe(expectedGrossIncome)
      })
    })
  })

  describe('employee', () => {
    const grossSalary = 1000000
    const netSalary = 1000000

    describe('calculateEmployeeNetSalary()', () => {
      it('is properly exported from the lib', () => {
        expect(calculateEmployeeNetSalary).toBeDefined()
        expect(typeof calculateEmployeeNetSalary).toBe('function')
      })

      it('has 2 parameters', () => {
        expect(calculateEmployeeNetSalary.length).toBe(2)
      })

      it('can be called', () => {
        const result = calculateEmployeeNetSalary(grossSalary, employeeRates)

        expect(result).toBeDefined()
      })

      it('runs well', () => {
        // Arrange
        const expectedNetSalaryResults: NetSalaryResults = {
          health: {
            employee: 45000,
            employer: 90000,
          },
          incomeTax: 119160,
          incomeTaxHighRate: 0,
          incomeTaxNormalRate: 150000,
          netSalary: 764840,
          social: {
            employee: 71000,
            employer: 248000,
          },
        }

        // Act
        const result = calculateEmployeeNetSalary(grossSalary, employeeRates)

        // Assert
        expect(result).toStrictEqual<NetSalaryResults>(expectedNetSalaryResults)
      })
    })

    describe('calculateEmployeeGrossSalary()', () => {
      it('exports a function', () => {
        expect(calculateEmployeeGrossSalary).toBeDefined()
        expect(typeof calculateEmployeeGrossSalary).toBe('function')
      })

      it('has 2 parameters', () => {
        expect(calculateEmployeeGrossSalary.length).toBe(2)
      })

      it('can be called', () => {
        const result = calculateEmployeeGrossSalary(netSalary, employeeRates)

        expect(result).toBeDefined()
      })

      it('runs well', () => {
        // Arrange
        const expectedGrossSalary = 1320381.4713896457

        // Act
        const result = calculateEmployeeGrossSalary(netSalary, employeeRates)

        // Assert
        expect(result).toBe(expectedGrossSalary)
      })
    })
  })
})
