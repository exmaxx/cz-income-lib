import { rates } from '../fixtures'
import calculateGrossSalary from './grossSalary'
import calculateNetSalary from '../net-salary/netSalary'

describe('calculate gross salary', () => {
  it('calculates gross salary from net salary', () => {
    const netSalary = 911640
    const expectedGrossSalary = 1200000 // i.e. 100000 per month
    const grossSalary = calculateGrossSalary(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below average salary', () => {
    const netSalary = 207000
    const expectedGrossSalary = 240000 // i.e. 20000 per month
    const grossSalary = calculateGrossSalary(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below minimal salary (e.g. part time) when employee pays difference to minimal health insurance', () => {
    const expectedGrossSalary = 216000 // i.e. 18000 per month

    const { netSalary } = calculateNetSalary(expectedGrossSalary, rates, {
      isRoundingEnabled: false,
    })

    const grossSalary = calculateGrossSalary(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below minimal salary (e.g. part time) when no tax is paid', () => {
    const expectedGrossSalary = 36000 // i.e. 3000 per month

    const { netSalary } = calculateNetSalary(expectedGrossSalary, rates, {
      isRoundingEnabled: false,
    })

    const grossSalary = calculateGrossSalary(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below minimal salary (e.g. part time), so low that income is negative due to paid health insurance', () => {
    const expectedGrossSalary = 24000 // i.e. 2000 per month

    const { netSalary } = calculateNetSalary(expectedGrossSalary, rates, {
      isRoundingEnabled: false,
    })

    const grossSalary = calculateGrossSalary(netSalary, rates)

    expect(grossSalary).toBeCloseTo(expectedGrossSalary, 5)
  })

  it('works for no income at all (the person would just pay health insurance by himself)', () => {
    const netSalary = -rates.healthRates.minAmount
    const expectedGrossSalary = 0
    const grossSalary = calculateGrossSalary(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for salary exceeding 36-times of average yearly salary and higher tax applies', () => {
    const expectedGrossSalary = 2040000 // i.e. 170000 per month

    const { netSalary } = calculateNetSalary(expectedGrossSalary, rates, {
      isRoundingEnabled: false,
    })

    const grossSalary = calculateGrossSalary(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for salary exceeding 48-times of average yearly salary and social insurance limit is hit', () => {
    const expectedGrossSalary = 3600000 // i.e. 300000 per month

    const { netSalary } = calculateNetSalary(expectedGrossSalary, rates, {
      isRoundingEnabled: false,
    })

    const grossSalary = calculateGrossSalary(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('throws exception when no result possible or incorrect input', () => {
    const netSalary = 207000 // any salary

    // deep copy
    const incorrectRates = {
      incomeRates: {
        ...rates.incomeRates,
      },
      socialRates: {
        ...rates.socialRates,
      },
      healthRates: {
        ...rates.healthRates,
      },
    }

    // intentionally incorrect rates
    incorrectRates.incomeRates.rate = 1
    incorrectRates.socialRates.employeeRate = 0
    incorrectRates.healthRates.employeeRate = 0

    expect(() => calculateGrossSalary(netSalary, incorrectRates)).toThrow()
  })

  it('return 0 when gross salary would be negative', () => {
    const negativeGrossSalary = -1

    const { netSalary } = calculateNetSalary(negativeGrossSalary, rates, {
      isRoundingEnabled: false,
    })

    const expectedGrossSalary = 0
    const grossSalary = calculateGrossSalary(netSalary, rates)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('finishes for integer net salary', () => {
    expect(() => calculateGrossSalary(10000002, rates)).not.toThrow()

    // medium income
    for (let netIncomeIterated = 1200000; netIncomeIterated < 1200005; netIncomeIterated++) {
      expect(() => calculateGrossSalary(netIncomeIterated, rates)).not.toThrow()
    }

    // high income
    for (let netIncomeIterated = 10000000; netIncomeIterated < 10000005; netIncomeIterated++) {
      expect(() => calculateGrossSalary(netIncomeIterated, rates)).not.toThrow()
    }

    // low income
    for (let netIncomeIterated = 200000; netIncomeIterated < 200005; netIncomeIterated++) {
      expect(() => calculateGrossSalary(netIncomeIterated, rates)).not.toThrow()
    }
  })
})
