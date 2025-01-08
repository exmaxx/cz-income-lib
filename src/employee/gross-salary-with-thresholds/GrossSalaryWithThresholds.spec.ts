import { rates } from '../fixtures'
import GrossSalaryCalculatorWithRules from './GrossSalaryWithThresholds'
import { Thresholds } from '../enums'

describe('Employee - Gross Salary', () => {
  const { ZERO_TAX, HIGH_TAX, MAX_BASE_SOCIAL, MIN_HEALTH } = Thresholds
  const calculator = GrossSalaryCalculatorWithRules.create(rates)

  it('calculates gross income out of net salary and rates', () => {
    // Setup
    const netSalary = 911640

    // Expectations
    const expectedGrossIncome = 1200000 // i.e. 100000 per month

    // Execution
    const grossIncome = calculator.calculate(netSalary)

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })

  it('works when minimal health insurance was covered by employee', () => {
    // (e.g. lower than minimal salary when working part-time)

    // Setup
    const netSalary = 179583.6

    // Expectations
    const expectedGrossIncome = 206400 // 17200 per month

    // Execution
    const grossIncome = calculator.calculate(netSalary, [MIN_HEALTH])

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
    const grossIncome = calculator.calculate(netSalary, [MIN_HEALTH, ZERO_TAX])

    // Assertion
    expect(grossIncome).toBeCloseTo(expectedGrossIncome, 5)
  })

  it('works when higher tax rate is applied to high salary', () => {
    // Setup
    const netSalary = 1491624.96

    // Expectations
    const expectedGrossIncome = 2040000 // i.e. 170000 per month

    // Execution
    const grossIncome = calculator.calculate(netSalary, [HIGH_TAX])

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })

  it('works when maximal social insurance limit is reached', () => {
    // Setup
    const netSalary = 2617625.424

    // Expectations
    const expectedGrossIncome = 3600000 // 300000 per month

    // Execution
    const grossIncome = calculator.calculate(netSalary, [HIGH_TAX, MAX_BASE_SOCIAL])

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })
})
