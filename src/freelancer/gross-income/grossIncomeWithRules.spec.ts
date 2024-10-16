import calculateGrossIncomeWithRules from './grossIncomeWithRules'
import { rates } from '../fixtures'
import calculateNetIncome from '../net-income/netIncome'

describe('estimates gross income from net income', () => {
  const income = 1000000
  const highIncome = 10000000

  describe('expenses as flat-rate percentage', () => {
    describe('normal income', () => {
      it.each([
        { percentage: 0.3, gross: income },
        { percentage: 0.4, gross: income },
        { percentage: 0.6, gross: 1500000 },
      ])('flat-rate: $percentage', ({ percentage, gross }) => {
        const expenses = { percentage }

        const { netIncome } = calculateNetIncome(gross, expenses, rates, {
          isRoundingEnabled: false,
        })

        const result = calculateGrossIncomeWithRules(netIncome, expenses, rates)
        expect(result).toEqual(gross)
      })
    })

    describe('low income', () => {
      it('returns 0 for a net income of 0', () => {
        expect(calculateGrossIncomeWithRules(0, { percentage: 0.6 }, rates)).toEqual(0)
      })

      it('returns 0 for a negative net income', () => {
        expect(calculateGrossIncomeWithRules(-1000, { percentage: 0.6 }, rates)).toEqual(0)
      })
    })

    describe('high income', () => {
      it.each([
        { percentage: 0.3, gross: highIncome },
        { percentage: 0.4, gross: highIncome },
        { percentage: 0.6, gross: highIncome },
        { percentage: 0.8, gross: highIncome },
      ])('flat-rate (high income): $percentage', ({ percentage, gross }) => {
        const expenses = { percentage }

        const { netIncome } = calculateNetIncome(gross, expenses, rates, {
          isRoundingEnabled: false,
        })

        const result = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
          isHighRateIncomeTaxUsed: true,
          isMaxFlatRateUsed: true,
          isMaxSocialBaseUsed: true,
        })

        expect(result).toEqual(gross)
      })
    })
  })

  describe('expenses as real amount', () => {
    describe('normal income', () => {
      it('estimates gross income from net income', () => {
        const expenses = { amount: 500000 }
        const { netIncome } = calculateNetIncome(income, expenses, rates, {
          isRoundingEnabled: false,
        })

        expect(calculateGrossIncomeWithRules(netIncome, expenses, rates)).toEqual(income)
      })
    })

    describe('low income', () => {
      it('works when minimal base for health insurance is reached', () => {
        const expenses = { amount: 700000 }
        const { netIncome } = calculateNetIncome(income, expenses, rates, {
          isRoundingEnabled: false,
        })

        const result = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
          isMinHealthBaseUsed: true,
        })

        expect(result).toBeCloseTo(income)
      })

      it('works when minimal base for social insurance is reached', () => {
        const expenses = { amount: 780000 }

        const { netIncome } = calculateNetIncome(income, expenses, rates, {
          isRoundingEnabled: false,
        })

        const estimatedGrossIncome = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
          // min. health base must be used because when social threshold is applied in the original net income calculation,
          // the health base must have already been applied also (health base is higher) - at least it holds for 2023 rates
          isMinHealthBaseUsed: true,
          isMinSocialBaseUsed: true,
        })

        expect(estimatedGrossIncome).toBeCloseTo(income)
      })

      it('works when zero income tax is reached', () => {
        const expenses = { amount: 800000 }

        const { netIncome } = calculateNetIncome(income, expenses, rates, {
          isRoundingEnabled: false,
        })

        const result = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
          // again, when zero tax option is used, the health and social base must be used as well
          isMinHealthBaseUsed: true,
          isMinSocialBaseUsed: true,
          isIncomeTaxZero: true,
        })

        expect(result).toEqual(income)
      })
    })

    describe('high income', () => {
      it('works when high tax is reached', () => {
        const expenses = { amount: 8000000 }

        const { netIncome } = calculateNetIncome(highIncome, expenses, rates, {
          isRoundingEnabled: false,
        })

        const result = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
          isHighRateIncomeTaxUsed: true,
        })

        expect(result).toEqual(highIncome)
      })

      it('works when maximal base for social insurance is reached', () => {
        const expenses = { amount: 6000000 }

        const { netIncome } = calculateNetIncome(highIncome, expenses, rates, {
          isRoundingEnabled: false,
        })

        const result = calculateGrossIncomeWithRules(netIncome, expenses, rates, {
          isHighRateIncomeTaxUsed: true,
          isMaxSocialBaseUsed: true,
        })

        expect(result).toEqual(highIncome)
      })
    })
  })
})
