import { rates } from './employee.fixtures'
import calculateGrossIncome from './grossIncome'

describe('Employee - Gross Income', () => {
  it('calculates gross income out of net salary and rates', () => {
    // Setup
    const netSalary = 76570

    // Expectations
    const expectedGrossIncome = 100000

    // Execution
    const grossIncome = calculateGrossIncome(netSalary, rates)

    // Assertion
    expect(grossIncome).toEqual(expectedGrossIncome)
  })
})
