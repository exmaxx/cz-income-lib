import calculateNetIncome from './netIncome'
import { rates } from './employee.fixtures'

describe('Employee - Net Income', () => {
  it('calculates taxes and insurance for employee', () => {
    expect(calculateNetIncome(100000, rates)).toEqual({
      incomeTax: 12430,
      incomeTaxNormalRate: 15000,
      incomeTaxHighRate: 0,
      netSalary: 76570,
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

  it('works for low income', () => {
    expect(calculateNetIncome(20000, rates)).toEqual({
      incomeTax: 430,
      incomeTaxNormalRate: 3000,
      incomeTaxHighRate: 0,
      netSalary: 17370,
      social: {
        employee: 1300,
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
      netSalary: 739,
      social: {
        employee: 195,
        employer: 744,
      },
      health: {
        employee: 2066,
        employer: 270,
      },
    })
  })

  it('works for really really low salary', () => {
    expect(calculateNetIncome(2000, rates)).toEqual({
      health: {
        employee: 2156,
        employer: 180,
      },
      incomeTax: 0,
      incomeTaxHighRate: 0,
      incomeTaxNormalRate: 300,
      netSalary: -286, // should he even work?
      social: {
        employee: 130,
        employer: 496,
      },
    })
  })

  it('adds tax for amounts above 4-times the average salary', () => {
    expect(calculateNetIncome(200000, rates)).toEqual({
      incomeTax: 30527,
      incomeTaxNormalRate: 24195,
      incomeTaxHighRate: 8902,
      netSalary: 149988,
      social: {
        employee: 10485,
        employer: 40002,
      },
      health: {
        employee: 9000,
        employer: 18000,
      },
    })
  })

  it('omits social insurance for amounts above 4-times the average salary', () => {
    expect(calculateNetIncome(300000, rates)).toEqual({
      health: {
        employee: 13500,
        employer: 27000,
      },
      incomeTax: 53527,
      incomeTaxHighRate: 31902,
      incomeTaxNormalRate: 24195,
      netSalary: 222488,
      social: {
        employee: 10485,
        employer: 40002,
      },
    })
  })
})
