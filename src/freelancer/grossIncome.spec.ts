import estimateGrossIncome from './grossIncome'
import { isAlmostEqual } from './utils'
import { rates } from './freelancer.fixtures'

describe('calculate gross income', () => {
  const grossIncome = 1000000

  describe('expenses as flat-rate percentage', () => {
    it('estimates gross income from net income', () => {
      expect(estimateGrossIncome(812740, { percentage: 0.4 }, rates)).toEqual(grossIncome)
      expect(estimateGrossIncome(1312740, { percentage: 0.6 }, rates)).toEqual(1500000)
    })

    it('returns 0 for a net income of 0', () => {
      expect(estimateGrossIncome(0, { percentage: 0.6 }, rates)).toEqual(0)
    })

    it('returns 0 for a negative net income', () => {
      expect(estimateGrossIncome(-1000, { percentage: 0.6 }, rates)).toEqual(0)
    })
  })

  describe('expenses as real amount', () => {
    it('estimates gross income from net income', () => {
      expect(estimateGrossIncome(349090, { amount: 500000 }, rates)).toEqual(grossIncome)
    })

    it('works when minimal base for health insurance is reached', () => {
      const result = estimateGrossIncome(210000, { amount: 700000 }, rates, {
        isMinHealthBaseForced: true,
      })

      expect(isAlmostEqual(result, grossIncome)).toBe(true)
    })

    it('works when minimal base for social insurance is reached', () => {
      const result = estimateGrossIncome(150000, { amount: 780000 }, rates, {
        // min. health base must be used because when social threshold is applied in the original net income calculation,
        // the health base must have already been applied also (health base is higher) - at least it holds for 2023 rates
        isMinHealthBaseForced: true,
        isMinSocialBaseForced: true,
      })

      expect(isAlmostEqual(result, grossIncome)).toBe(true)
    })

    it('works when zero income tax is reached', () => {
      const result = estimateGrossIncome(132000, { amount: 800000 }, rates, {
        // again, when zero tax option is used, the health and social base must be used as well
        isMinHealthBaseForced: true,
        isMinSocialBaseForced: true,
        isIncomeTaxZero: true,
      })

      expect(isAlmostEqual(result, grossIncome)).toBe(true)
    })

    xit('works when maximal base for social insurance is reached', () => {
      // tdb.
    })
  })
})
