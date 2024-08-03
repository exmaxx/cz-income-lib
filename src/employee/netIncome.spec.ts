import calculateNetIncome from './netIncome'
import { rates } from './employee.fixtures'

describe('Employee - Net Income', () => {
  it('calculates taxes and insurance for employee', () => {
    // 100000 CZK per month
    expect(calculateNetIncome(1200000, rates)).toEqual({
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

  it('works for low income', () => {
    // 20000 CZK per month
    expect(calculateNetIncome(240000, rates)).toEqual({
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

  it('works for income lower than minimal salary (e.g. part time)', () => {
    // 3000 CZK per month
    expect(calculateNetIncome(36000, rates)).toEqual({
      health: {
        // internet calculators count this monthly and then multiply by 12, but we caclulate it yearly,
        // so there might be a single-digit difference
        employee: 27378,
        employer: 3240,
      },
      incomeTax: 0,
      incomeTaxHighRate: 0,
      incomeTaxNormalRate: 5400,
      netSalary: 6066,
      social: {
        employee: 2556,
        employer: 8928,
      },
    })
  })

  it('works for really really low salary (where employee must pay the difference to the minimum amount)', () => {
    // 2000 CZK per month
    expect(calculateNetIncome(24000, rates)).toEqual({
      health: {
        employee: 28458, // not all internet calculators check for minimal health insurance (idnes.cz does)
        employer: 2160,
      },
      incomeTax: 0,
      incomeTaxHighRate: 0,
      incomeTaxNormalRate: 3600,
      netSalary: -6162, // do it make even sense to work?
      social: {
        employee: 1704,
        employer: 5952,
      },
    })
  })

  it('adds tax for amounts above 36-times the average salary', () => {
    // 170000 CZK per month
    expect(calculateNetIncome(2040000, rates)).toEqual({
      health: {
        employee: 91800,
        employer: 183600,
      },
      incomeTax: 311736,
      incomeTaxHighRate: 105154,
      incomeTaxNormalRate: 237422,
      netSalary: 1491624,
      social: {
        employee: 144840,
        employer: 505920,
      },
    })
  })

  it('omits social insurance for amounts above 48-times the average salary', () => {
    expect(calculateNetIncome(3600000, rates)).toEqual({
      health: {
        employee: 162000,
        employer: 324000,
      },
      incomeTax: 670536,
      incomeTaxHighRate: 463954,
      incomeTaxNormalRate: 237422,
      netSalary: 2617624,
      social: {
        employee: 149840,
        employer: 892800,
      },
    })
  })
})
