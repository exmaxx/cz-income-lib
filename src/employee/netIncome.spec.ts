import calculateNetIncome from './netIncome'
import { rates } from './employee.fixtures'

describe('Employee - Net Income', () => {
  it('calculates taxes and insurance for employee', () => {
    expect(calculateNetIncome(100000, rates)).toEqual({
      incomeTax: 12430,
      incomeTaxNormalRate: 15000,
      incomeTaxHighRate: 0,
      netSalary: 75970,
      social: {
        employee: 7100,
        employer: 24800,
      },
      health: {
        employee: 4500,
        employer: 9000,
      },
    })
  })

  it('works for low income', () => {
    expect(calculateNetIncome(20000, rates)).toEqual({
      incomeTax: 430,
      incomeTaxNormalRate: 3000,
      incomeTaxHighRate: 0,
      netSalary: 17250,
      social: {
        employee: 1420,
        employer: 4960,
      },
      health: {
        employee: 900,
        employer: 1800,
      },
    })
  })

  it('works for income lower than minimal salary (e.g. part time)', () => {
    expect(calculateNetIncome(3000, rates)).toEqual({
      incomeTax: 0,
      incomeTaxHighRate: 0,
      incomeTaxNormalRate: 450,
      netSalary: 505,
      social: {
        employee: 213,
        employer: 744,
      },
      health: {
        employee: 2282,
        employer: 270,
      },
    })
  })

  it('works for really really low salary', () => {
    expect(calculateNetIncome(2000, rates)).toEqual({
      health: {
        employee: 2372,
        employer: 180,
      },
      incomeTax: 0,
      incomeTaxHighRate: 0,
      incomeTaxNormalRate: 300,
      netSalary: -514, // should he even work?
      social: {
        employee: 142,
        employer: 496,
      },
    })
  })

  it('adds tax for amounts above 3-times the average salary', () => {
    expect(calculateNetIncome(170000, rates)).toEqual({
      health: {
        employee: 7650,
        employer: 15300,
      },
      incomeTax: 25979,
      incomeTaxHighRate: 8763,
      incomeTaxNormalRate: 19786,
      netSalary: 124301,
      social: {
        employee: 12070,
        employer: 42160,
      },
    })
  })

  it('omits social insurance for amounts above 4-times the average salary', () => {
    expect(calculateNetIncome(300000, rates)).toEqual({
      health: {
        employee: 13500,
        employer: 27000,
      },
      incomeTax: 55879,
      incomeTaxHighRate: 38663,
      incomeTaxNormalRate: 19786,
      netSalary: 218134,
      social: {
        employee: 12487,
        employer: 43616,
      },
    })
  })
})
