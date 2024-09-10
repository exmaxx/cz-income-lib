import { rates } from '../fixtures'
import calculateGrossIncome from './grossSalary'

describe('Employee - Gross Salary', () => {
  it('calculates gross income out of net salary and rates', () => {
    // Setup
    const netSalary = 911640

    // Expectations
    const expectedGrossIncome = 1200000 // i.e. 100000 per month

    // Execution
    const grossIncome = calculateGrossIncome(netSalary, rates)

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })

  it('works when minimal health insurance was covered by employee', () => {
    // (e.g. lower than minimal salary when working part-time)

    // Setup
    const netSalary = 179583

    // Expectations
    const expectedGrossIncome = 206399 // In real life it was 206400 (17200 per month), but it's a rounding issue

    // Execution
    const grossIncome = calculateGrossIncome(netSalary, rates, {
      isMinHealthForced: true,
    })

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })

  it('works when tax after credit subtracted is negative', () => {
    // (e.g. lower than minimal salary when working part-time)

    // Setup
    const netSalary = 91662

    // Expectations
    const expectedGrossIncome = 120000 // i.e. 10000 per month

    // Execution
    const grossIncome = calculateGrossIncome(netSalary, rates, {
      isMinHealthForced: true,
      isTaxZero: true,
    })

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })

  it('works when higher tax rate is applied to high salary', () => {
    // Setup
    const netSalary = 1491625

    // Expectations
    const expectedGrossIncome = 2040000 // i.e. 170000 per month

    // Execution
    const grossIncome = calculateGrossIncome(netSalary, rates, {
      isTaxHighRate: true,
    })

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })

  it('works when maximal social insurance limit is reached', () => {
    // Setup
    const netSalary = 2617625

    // Expectations
    const expectedGrossIncome = 3599999 // In real life it was 3600000 (300000 per month), but it's a rounding issue

    // Execution
    const grossIncome = calculateGrossIncome(netSalary, rates, {
      isTaxHighRate: true,
      isSocialMaxBase: true,
    })

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })
})
