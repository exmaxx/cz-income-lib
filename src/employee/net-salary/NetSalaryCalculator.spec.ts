import { rates } from '../fixtures'
import NetSalaryCalculator from './NetSalaryCalculator'
import SocialCalculator from './social/SocialCalculator'
import HealthCalculator from './health/HealthCalculator'
import TaxCalculator from './tax/TaxCalculator'

describe('Employee - Net Income', () => {
  const { incomeRates, socialRates, healthRates } = rates

  const socialCalculator = new SocialCalculator(socialRates)
  const healthCalculator = new HealthCalculator(healthRates)
  const taxCalculator = new TaxCalculator(incomeRates)
  const netSalaryCalculator = new NetSalaryCalculator(socialCalculator, healthCalculator, taxCalculator)

  describe('medium salary', () => {
    it('calculates taxes and insurance', () => {
      const grossSalaryMonthly = 100000
      const result = netSalaryCalculator.calculate(12 * grossSalaryMonthly)

      expect(result).toEqual({
        health: {
          employee: 54000,
          employer: 108000,
        },
        incomeTax: 149160,
        incomeTaxHighRate: 0,
        incomeTaxNormalRate: 180000,
        netSalary: 911640,
        social: {
          employee: 85200,
          employer: 297600,
        },
      })
    })

    it('works for salary just above minimal salary', () => {
      const grossSalaryMonthly = 20000
      const result = netSalaryCalculator.calculate(12 * grossSalaryMonthly)

      expect(result).toEqual({
        health: {
          employee: 10800,
          employer: 21600,
        },
        incomeTax: 5160,
        incomeTaxHighRate: 0,
        incomeTaxNormalRate: 36000,
        netSalary: 207000,
        social: {
          employee: 17040,
          employer: 59520,
        },
      })
    })
  })

  describe('low salary - lower than minimal salary (e.g. part time)', () => {
    it('minimal health insurance is reached - employee must pay the difference to the minimum amount of health insurance', () => {
      const grossSalaryMonthly = 18000
      const result = netSalaryCalculator.calculate(12 * grossSalaryMonthly)

      expect(result.health).toEqual({
        // NOTE: internet calculators count this monthly and then multiply by 12, but we calculate it yearly,
        //   so there might be a single-digit difference
        // NOTE: not all internet calculators check for minimal health insurance (e.g. idnes.cz does it
        employee: 11178,
        employer: 19440,
      })
    })

    it('income tax is zero', () => {
      const grossSalaryMonthly = 3000
      const result = netSalaryCalculator.calculate(12 * grossSalaryMonthly)

      expect(result.incomeTax).toEqual(0)
    })

    it('negative salary', () => {
      const grossSalaryMonthly = 2000
      const result = netSalaryCalculator.calculate(12 * grossSalaryMonthly)

      expect(result.incomeTax).toEqual(0)
      expect(result.netSalary).toEqual(-6162)
    })
  })

  describe('high salary', () => {
    it('adds higher tax for amounts above 36-times the average salary', () => {
      const grossSalaryMonthly = 170000
      const result = netSalaryCalculator.calculate(12 * grossSalaryMonthly)

      const expected = {
        incomeTax: 311736,
        incomeTaxHighRate: 105154,
        incomeTaxNormalRate: 237422,
        netSalary: 1491624,
      }

      expect(result).toMatchObject(expected)
    })

    it('omits social insurance for amounts above 48-times the average salary', () => {
      const grossSalaryMonthly = 300000
      const result = netSalaryCalculator.calculate(12 * grossSalaryMonthly)

      const expected = {
        social: {
          employee: 149840,
          employer: 892800,
        },
      }

      expect(result).toMatchObject(expected)
    })
  })
})
