// Fixtures for tests only

import { Rates } from './types'
import { AVG_SALARY_MONTHLY } from './constants'

// For 2023
const rates: Rates = {
  incomeRates: {
    rate: 0.15, // 15%
    credit: 30840,
    nonTaxable: 0,
    highRate: 0.23, // 23%
    highRateThreshold: AVG_SALARY_MONTHLY * 48, // = 1 935 552; 48-times average salary per year (or 4-times the average salary per month)
  },
  healthRates: {
    basePercentage: 0.5, // 50%
    minBase: 20162 * 12, // 241944; 20162 CZK per month
    rate: 0.135, // 13.5%
  },
  socialRates: {
    basePercentage: 0.5, // 50%
    minBase: AVG_SALARY_MONTHLY * 0.25 * 12, // = 120 972; 25% of average salary per month
    maxBase: AVG_SALARY_MONTHLY * 48, // = 1 935 552; 48-times average salary
    rate: 0.292, // 29.2% = 28% (retirement) + 1.2% (unemployment)
  },
}

export { rates }
