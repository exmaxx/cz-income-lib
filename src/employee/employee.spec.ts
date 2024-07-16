import calculate from './employee'
import { Rates } from './employee.types'

describe('employee', () => {
  it('calculates taxes and insurance for employee', () => {
    // For 2023
    const rates: Rates = {
      incomeRates: {
        rate: 0.15, // 15%
        credit: 2570,
      },

      socialRates: {
        employeeRate: 0.065, // 6.5%
        employerRate: 0.248, // 24.8%
      },

      healthRates: {
        employeeRate: 0.045, // 4.5%
        employerRate: 0.09, // 9%
      },
    }

    const salary = 100000

    expect(calculate(rates, salary)).toEqual({
      incomeTax: 12430,
      social: {
        employee: 6500,
        employer: 24800,
      },
      health: {
        employee: 4500,
        employer: 9000,
      },
    })
  })
})
