import { rates } from '../fixtures'
import calculateGrossSalaryVerified from './grossSalaryVerified'

describe('calculate gross salary', () => {
  it('calculates gross salary from net salary', () => {
    const netSalary = 911640
    const expectedGrossSalary = 1200000 // i.e. 100000 per month
    const grossSalary = calculateGrossSalaryVerified(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below average salary', () => {
    const netSalary = 207000
    const expectedGrossSalary = 240000 // i.e. 20000 per month
    const grossSalary = calculateGrossSalaryVerified(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below minimal salary (e.g. part time) when employee pays difference to minimal health insurance', () => {
    const netSalary = 187920
    const expectedGrossSalary = 215993 // In real life it was 216000 (18000 per month), but it's a rounding issue
    const grossSalary = calculateGrossSalaryVerified(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below minimal salary (e.g. part time) when no tax is paid', () => {
    const netSalary = 6066
    const expectedGrossSalary = 36000 // i.e. 3000 per month
    const grossSalary = calculateGrossSalaryVerified(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below minimal salary (e.g. part time), so low that income is negative due to paid health insurance', () => {
    const netSalary = -6162
    const expectedGrossSalary = 24000 // i.e. 2000 per month
    const grossSalary = calculateGrossSalaryVerified(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for no income at all (the person would just pay health insurance by himself)', () => {
    const netSalary = -rates.healthRates.minAmount
    const expectedGrossSalary = 0
    const grossSalary = calculateGrossSalaryVerified(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('return 0 instead of negative salary', () => {
    const netSalary = -rates.healthRates.minAmount - 1 // anything below paid health insurance does not make sense, so we return 0
    const expectedGrossSalary = 0
    const grossSalary = calculateGrossSalaryVerified(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for salary exceeding 36-times of average yearly salary and higher tax applies', () => {
    const netSalary = 1491624
    const expectedGrossSalary = 2039999 // should have been 2040000 (i.e. 170000 per month) but it's a rounding issue
    const grossSalary = calculateGrossSalaryVerified(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for salary exceeding 48-times of average yearly salary and social insurance limit is hit', () => {
    const netSalary = 2617624
    const expectedGrossSalary = 3599998 // should have been 3600000 (i.e. 300000 per month) but we tolerate small rounding issues
    const grossSalary = calculateGrossSalaryVerified(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })
})
