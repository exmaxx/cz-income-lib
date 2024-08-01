// Fixtures for tests only

import { Rates } from './employee.types'

const MINIMAL_SALARY = 18900
const AVG_SALARY = 43967

// For 2024
const rates: Rates = {
  incomeRates: {
    rate: 0.15, // 15%
    credit: 30840 / 12,
    minSalary: MINIMAL_SALARY,
    highRate: 0.23, // 23%
    highRateThreshold: AVG_SALARY * 36, // = 1582812; 36-times average salary per year (or 3-times the average salary per month)
  },

  socialRates: {
    employeeRate: 0.071, // 7.1% (sickness 0.6%, pension 6.5%, unemployment 0%)
    employerRate: 0.248, // 24.8% (sickness 2.1%, pension 21.5%, unemployment 1.2%)
    maxBase: AVG_SALARY * 48, // = 2110416; 48-times average salary per year
  },

  healthRates: {
    employeeRate: 0.045, // 4.5%
    employerRate: 0.09, // 9%
    minAmount: 0, // is calculated below
  },
}

rates.healthRates.minAmount = Math.ceil(
  MINIMAL_SALARY * (rates.healthRates.employeeRate + rates.healthRates.employerRate)
)

export { rates }
