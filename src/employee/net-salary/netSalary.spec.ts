import calculateNetSalary from './netSalary'
import { rates } from '../fixtures'

describe('Employee - Net Income', () => {
  describe('mediumsalary', () => {
    it('calculates taxes and insurance', () => {
      const grossSalaryMonthly = 100000
      const result = calculateNetSalary(12 * grossSalaryMonthly, rates)

      expect(result).toEqual({
        health: {
          employee: 54000,
          employer: 108000,
        },
        incomeTax: 149160,
        incomeTaxHighRate: 0,
        incomeTaxNormalRate: 180000,
        netSalary: 911640,
        reachedThresholds: [],
        social: {
          employee: 85200,
          employer: 297600,
        },
      })
    })

    it('works for salary just above minimal salary', () => {
      const grossSalaryMonthly = 20000
      const result = calculateNetSalary(12 * grossSalaryMonthly, rates)

      expect(result).toEqual({
        health: {
          employee: 10800,
          employer: 21600,
        },
        incomeTax: 5160,
        incomeTaxHighRate: 0,
        incomeTaxNormalRate: 36000,
        netSalary: 207000,
        reachedThresholds: [],
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
      const result = calculateNetSalary(12 * grossSalaryMonthly, rates)

      expect(result.health).toEqual({
        // NOTE: internet calculators count this monthly and then multiply by 12, but we calculate it yearly,
        //   so there might be a single-digit difference
        // NOTE: not all internet calculators check for minimal health insurance (e.g. idnes.cz does it
        employee: 11178,
        employer: 19440,
      })

      expect(result.reachedThresholds).toContain('MIN_HEALTH')
    })

    it('income tax is zero', () => {
      const grossSalaryMonthly = 3000
      const result = calculateNetSalary(12 * grossSalaryMonthly, rates)

      expect(result.incomeTax).toEqual(0)
      expect(result.reachedThresholds).toContain('ZERO_TAX')
    })

    it('negative salary', () => {
      const grossSalaryMonthly = 2000
      const result = calculateNetSalary(12 * grossSalaryMonthly, rates)

      expect(result.incomeTax).toEqual(0)
      expect(result.netSalary).toEqual(-6162)
      expect(result.reachedThresholds).toEqual(expect.arrayContaining(['ZERO_TAX', 'MIN_HEALTH']))
    })
  })

  describe('high salary', () => {
    it('adds higher tax for amounts above 36-times the average salary', () => {
      const grossSalaryMonthly = 170000
      const result = calculateNetSalary(12 * grossSalaryMonthly, rates)

      const expected = {
        incomeTax: 311736,
        incomeTaxHighRate: 105154,
        incomeTaxNormalRate: 237422,
        netSalary: 1491624,
      }

      expect(result).toMatchObject(expected)
      expect(result.reachedThresholds).toEqual(expect.arrayContaining(['HIGH_TAX']))
    })

    it('omits social insurance for amounts above 48-times the average salary', () => {
      const grossSalaryMonthly = 300000
      const result = calculateNetSalary(12 * grossSalaryMonthly, rates)

      const expected = {
        social: {
          employee: 149840,
          employer: 892800,
        },
      }

      expect(result).toMatchObject(expected)
      expect(result.reachedThresholds).toContain('MAX_BASE_SOCIAL')
    })
  })
})
