import calculateNetIncome from '../net-income/netIncome'
import { rates } from '../fixtures'
import { Expenses } from '../types'
import { Rates } from '../rates'
import GrossIncomeCalculator from './grossIncome'

describe('expenses as a flat rate percentage', () => {
  it.each([
    { netIncome: 1200000 }, // 100 000 CZK / month
    { netIncome: 8000000 }, // 666 667 CZK / month
    { netIncome: 300000 }, // 25 000 CZK / month
  ])('finishes calculation (net income $netIncome)', ({ netIncome }) => {
    // Arrange
    const expenses: Expenses = {
      percentage: 0.6,
    }

    for (
      let netIncomeIterated = netIncome;
      netIncomeIterated < netIncome + 5;
      netIncomeIterated++
    ) {
      const grossIncomeCalculator = new GrossIncomeCalculator(netIncomeIterated, expenses, rates)

      // Act
      const act = () => grossIncomeCalculator.calculate()

      // Assert
      expect(act).not.toThrow()
    }
  })

  describe.each([
    { grossIncome: 0 },
    { grossIncome: 600000 }, // 50 000 CZK / month
    { grossIncome: 1200000 }, // 100 000 CZK / month
    { grossIncome: 2000000 }, // 166 667 CZK / month
    { grossIncome: 2600000 }, // 216 667 CZK / month
    { grossIncome: 10000000 }, // 833 333 CZK / month
  ])('gross income $grossIncome', ({ grossIncome }) => {
    it.each([{ percentage: 0.3 }, { percentage: 0.4 }, { percentage: 0.6 }, { percentage: 0.8 }])(
      'calculates gross income from net income (rate $percentage)',
      ({ percentage }) => {
        // Arrange
        const expenses: Expenses = {
          percentage,
        }

        const { netIncome } = calculateNetIncome(grossIncome, expenses, rates, {
          isRoundingEnabled: false,
        })

        const grossIncomeCalculator = new GrossIncomeCalculator(netIncome, expenses, rates)

        // Act
        const result = grossIncomeCalculator.calculate()

        // Assert
        expect(result).toBeCloseTo(grossIncome, 5)
      }
    )
  })

  describe('zero net income', () => {
    const { minDeductions } = rates

    it.each([{ percentage: 0.3 }, { percentage: 0.4 }, { percentage: 0.6 }, { percentage: 0.8 }])(
      'returns minimal deductions for a zero net income ($percentage rate)',
      ({ percentage }) => {
        // Arrange
        const grossIncomeCalculator = new GrossIncomeCalculator(0, { percentage }, rates)

        // Act
        const result = grossIncomeCalculator.calculate()

        // Assert
        expect(result).toEqual(minDeductions)
      }
    )
  })

  describe('negative net income', () => {
    const { minDeductions } = rates

    it.each([{ percentage: 0.3 }, { percentage: 0.4 }, { percentage: 0.6 }, { percentage: 0.8 }])(
      'returns 0 for a net income equal to negative minimal deductions ($percentage rate)',
      ({ percentage }) => {
        // Arrange
        const grossIncomeCalculator = new GrossIncomeCalculator(
          -minDeductions,
          { percentage },
          rates
        )

        // Act
        const result = grossIncomeCalculator.calculate()

        // Assert
        expect(result).toEqual(0)
      }
    )

    it.each([{ percentage: 0.3 }, { percentage: 0.4 }, { percentage: 0.6 }, { percentage: 0.8 }])(
      'still returns 0, even when net income is below to negative minimal deductions ($percentage rate)',
      ({ percentage }) => {
        // Arrange
        const grossIncomeCalculator = new GrossIncomeCalculator(
          -minDeductions - 1,
          { percentage },
          rates
        )

        // Act
        const result = grossIncomeCalculator.calculate()

        // Assert
        expect(result).toEqual(0)
      }
    )
  })
})

describe('expenses as real amount', () => {
  it('finishes for consecutive net income values (covers cases that have decimal intermediate result)', () => {
    // medium income
    for (let netIncomeIterated = 1200000; netIncomeIterated < 1200005; netIncomeIterated++) {
      const grossIncomeCalculator = new GrossIncomeCalculator(
        netIncomeIterated,
        { amount: 500000 },
        rates
      )
      expect(() => grossIncomeCalculator.calculate()).not.toThrow()
    }

    // high income
    for (let netIncomeIterated = 8000000; netIncomeIterated < 8000005; netIncomeIterated++) {
      const grossIncomeCalculator = new GrossIncomeCalculator(
        netIncomeIterated,
        { amount: 3000000 },
        rates
      )

      expect(() => grossIncomeCalculator.calculate()).not.toThrow()
    }

    // low income
    for (let netIncomeIterated = 300000; netIncomeIterated < 300005; netIncomeIterated++) {
      const grossIncomeCalculator = new GrossIncomeCalculator(
        netIncomeIterated,
        { amount: 100000 },
        rates
      )
      expect(() => grossIncomeCalculator.calculate()).not.toThrow()
    }
  })

  describe.each([
    { grossIncome: 300000 },
    { grossIncome: 500000 },
    { grossIncome: 1000000 },
    { grossIncome: 2600000 },
    { grossIncome: 10000000 },
  ])('for gross income $grossIncome', ({ grossIncome }) => {
    it('calculates gross income from net income', () => {
      // Arrange
      const expenses = { amount: grossIncome * 0.5 }

      const { netIncome } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      const grossIncomeCalculator = new GrossIncomeCalculator(netIncome, expenses, rates)

      // Act
      const result = grossIncomeCalculator.calculate()

      // Assert
      expect(result).toBeCloseTo(grossIncome, 5)
    })

    it('works when minimal base for health insurance is reached', () => {
      // Arrange
      const expenses: Expenses = {
        amount: grossIncome - 300000,
      }

      const { netIncome, healthAssessmentBase } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      const grossIncomeCalculator = new GrossIncomeCalculator(netIncome, expenses, rates)

      // Act
      const result = grossIncomeCalculator.calculate()

      // Assert
      expect(healthAssessmentBase).toEqual(rates.healthRates.minBase)
      expect(result).toBeCloseTo(grossIncome, 5)
    })

    it('works when minimal base for social insurance is reached', () => {
      // Arrange
      const expenses: Expenses = {
        amount: grossIncome - 220000,
      }

      const { netIncome, socialAssessmentBase } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      const grossIncomeCalculator = new GrossIncomeCalculator(netIncome, expenses, rates)

      // Act
      const result = grossIncomeCalculator.calculate()

      // Assert
      expect(socialAssessmentBase).toEqual(rates.socialRates.minBase)
      expect(result).toBeCloseTo(grossIncome, 5)
    })

    it('works when zero income tax is reached', () => {
      // Arrange
      const expenses: Expenses = {
        amount: grossIncome - 200000,
      }

      const { netIncome, incomeTax } = calculateNetIncome(grossIncome, expenses, rates, {
        isRoundingEnabled: false,
      })

      const grossIncomeCalculator = new GrossIncomeCalculator(netIncome, expenses, rates)

      // Act
      const result = grossIncomeCalculator.calculate()

      // Assert
      expect(incomeTax).toBe(0)
      expect(result).toEqual(grossIncome)
    })
  })

  describe.each([{ amount: 0 }, { amount: 500000 }])(
    'zero gross income (for expenses of $amount)',
    ({ amount }) => {
      const { minDeductions } = rates

      it('returns original expenses for a net income equal to negative minimal deductions', () => {
        // Arrange
        const calculator = new GrossIncomeCalculator(-minDeductions, { amount }, rates)

        // Act
        const result = calculator.calculate()

        // Assert
        expect(result).toEqual(amount)
      })

      it('still returns 0 for a net income below minimal deductions', () => {
        // Arrange
        const calculator = new GrossIncomeCalculator(-minDeductions - 1, { amount }, rates)

        // Act
        const result = calculator.calculate()

        // Assert
        expect(result).toEqual(amount)
      })
    }
  )

  describe('bad configuration', () => {
    it('throws exception when no result', () => {
      // Arrange
      const incorrectRates = new Rates(
        { ...rates.incomeRates, credit: 1000000 },
        rates.socialRates,
        rates.healthRates
      )

      const grossIncomeCalculator = new GrossIncomeCalculator(
        349090,
        { amount: 500000 },
        incorrectRates
      )

      // Act
      const act = () => grossIncomeCalculator.calculate()

      // Assert
      expect(act).toThrow()
    })
  })
})

// Only use this for thorough testing. It takes half an hour to run.
xdescribe.each([[{ percentage: 0.6 }, { amount: 500000 }]])('carpet bombing', (expenses) => {
  it('successfully returns a value (no throw)', () => {
    for (let i = 0; i < 20000000; i++) {
      // Arrange
      let grossIncomeCalculator = new GrossIncomeCalculator(i, expenses, rates)

      // Act
      const act = () => grossIncomeCalculator.calculate()

      // Assert
      expect(act).not.toThrow()
    }
  })
})
