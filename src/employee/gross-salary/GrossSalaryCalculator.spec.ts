import { rates } from '../fixtures'
import NetSalaryCalculator from '../net-salary/NetSalaryCalculator'
import SocialCalculator from '../net-salary/social/SocialCalculator'
import HealthCalculator from '../net-salary/health/HealthCalculator'
import TaxCalculator from '../net-salary/tax/TaxCalculator'
import GrossSalaryCalculator from './GrossSalaryCalculator'

describe('calculate gross salary', () => {
  const { incomeRates, socialRates, healthRates } = rates

  const socialCalculator = new SocialCalculator(socialRates)
  const healthCalculator = new HealthCalculator(healthRates)
  const taxCalculator = new TaxCalculator(incomeRates)
  const netCalculator = new NetSalaryCalculator(socialCalculator, healthCalculator, taxCalculator)
  const grossCalculator = GrossSalaryCalculator.create(rates)

  it('calculates gross salary from net salary', () => {
    const netSalary = 911640
    const expectedGrossSalary = 1200000 // i.e. 100000 per month
    const grossSalary = grossCalculator.calculate(netSalary)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below average salary', () => {
    const netSalary = 207000
    const expectedGrossSalary = 240000 // i.e. 20000 per month
    const grossSalary = grossCalculator.calculate(netSalary)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below minimal salary (e.g. part time) when employee pays difference to minimal health insurance', () => {
    const expectedGrossSalary = 216000 // i.e. 18000 per month

    const { netSalary } = netCalculator.calculate(expectedGrossSalary, {
      isRoundingEnabled: false,
    })

    const grossSalary = grossCalculator.calculate(netSalary)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below minimal salary (e.g. part time) when no tax is paid', () => {
    const expectedGrossSalary = 36000 // i.e. 3000 per month

    const { netSalary } = netCalculator.calculate(expectedGrossSalary, {
      isRoundingEnabled: false,
    })

    const grossSalary = grossCalculator.calculate(netSalary)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for below minimal salary (e.g. part time), so low that income is negative due to paid health insurance', () => {
    const expectedGrossSalary = 24000 // i.e. 2000 per month

    const { netSalary } = netCalculator.calculate(expectedGrossSalary, {
      isRoundingEnabled: false,
    })

    const grossSalary = grossCalculator.calculate(netSalary)

    expect(grossSalary).toBeCloseTo(expectedGrossSalary, 5)
  })

  it('works for no income at all (the person would just pay health insurance by himself)', () => {
    const netSalary = -rates.healthRates.minAmount
    const expectedGrossSalary = 0
    const grossSalary = grossCalculator.calculate(netSalary)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for salary exceeding 36-times of average yearly salary and higher tax applies', () => {
    const expectedGrossSalary = 2040000 // i.e. 170000 per month

    const { netSalary } = netCalculator.calculate(expectedGrossSalary, {
      isRoundingEnabled: false,
    })

    const grossSalary = grossCalculator.calculate(netSalary)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('works for salary exceeding 48-times of average yearly salary and social insurance limit is hit', () => {
    const expectedGrossSalary = 3600000 // i.e. 300000 per month

    const { netSalary } = netCalculator.calculate(expectedGrossSalary, {
      isRoundingEnabled: false,
    })

    const grossSalary = grossCalculator.calculate(netSalary)

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

    const badGrossSalaryCalculator = GrossSalaryCalculator.create(incorrectRates)

    expect(() => badGrossSalaryCalculator.calculate(netSalary)).toThrow()
  })

  it('return 0 when gross salary would be negative', () => {
    const negativeGrossSalary = -1

    const { netSalary } = netCalculator.calculate(negativeGrossSalary, {
      isRoundingEnabled: false,
    })

    const expectedGrossSalary = 0
    const grossSalary = grossCalculator.calculate(netSalary)

    expect(grossSalary).toEqual(expectedGrossSalary)
  })

  it('finishes for integer net salary', () => {
    expect(() => grossCalculator.calculate(10000002)).not.toThrow()

    // medium income
    for (let netIncomeIterated = 1200000; netIncomeIterated < 1200005; netIncomeIterated++) {
      expect(() => grossCalculator.calculate(netIncomeIterated)).not.toThrow()
    }

    // high income
    for (let netIncomeIterated = 10000000; netIncomeIterated < 10000005; netIncomeIterated++) {
      expect(() => grossCalculator.calculate(netIncomeIterated)).not.toThrow()
    }

    // low income
    for (let netIncomeIterated = 200000; netIncomeIterated < 200005; netIncomeIterated++) {
      expect(() => grossCalculator.calculate(netIncomeIterated)).not.toThrow()
    }
  })
})
