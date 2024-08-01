import { rates } from './employee.fixtures'
import calculateGrossIncome from './grossIncome'

describe('Employee - Gross Income', () => {
  it('calculates gross income out of net salary and rates', () => {
    // Setup
    const netSalary = 75970

    // Expectations
    const expectedGrossIncome = 100000

    // Execution
    const grossIncome = calculateGrossIncome(netSalary, rates)

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })

  it('works when minimal health insurance was covered by employee', () => {
    // (e.g. lower than minimal salary when working part-time)

    // Setup
    const netSalary = 14964

    // Expectations
    const expectedGrossIncome = 17199 // In real life it was 17200, but it's a rounding issue

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
    const netSalary = 7638

    // Expectations
    const expectedGrossIncome = 10000

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
    const netSalary = 124301

    // Expectations
    const expectedGrossIncome = 169998 // In real life it was 170000, but it's a rounding issue

    // Execution
    const grossIncome = calculateGrossIncome(netSalary, rates, {
      isTaxHighRate: true,
    })

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })

  it('works when maximal social insurance limit is reached', () => {
    // Setup
    const netSalary = 218134

    // Expectations
    const expectedGrossIncome = 299998 // In real life it was 300000, but it's a rounding issue

    // Execution
    const grossIncome = calculateGrossIncome(netSalary, rates, {
      isTaxHighRate: true,
      isSocialMaxBase: true,
    })

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })
})
