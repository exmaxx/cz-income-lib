import type { Expenses, Rates as FreelancerRates } from './freelancer/types'
import type { Rates as EmployeeRates } from './employee/types'
import { NetIncomeResults } from './freelancer/net-income/types'
import GrossIncomeCalculator from './freelancer/gross-income/GrossIncomeCalculator'
import NetIncomeCalculator from './freelancer/net-income/NetIncomeCalculator'
import PercentageExpensesWrapper from './freelancer/expenses/PercentageExpensesWrapper'
import FixedExpensesWrapper from './freelancer/expenses/FixedExpensesWrapper'

export { default as calculateEmployeeNetSalary } from './employee/net-salary/netSalary'
export { default as calculateEmployeeGrossSalary } from './employee/gross-salary/grossSalaryWithRules'

export type { FreelancerRates, EmployeeRates }

export function calculateFreelancerGrossIncome(
  netIncome: number,
  expenses: Expenses,
  rates: FreelancerRates
): number {
  const calculator = new GrossIncomeCalculator(rates)
  const expensesWrapper = wrapExpenses(expenses)

  return calculator.calculate(netIncome, expensesWrapper)
}

export function calculateFreelancerNetIncome(
  grossIncome: number,
  expenses: Expenses,
  rates: FreelancerRates
): NetIncomeResults {
  const calculator = new NetIncomeCalculator(rates)
  const expensesWrapper = wrapExpenses(expenses)

  return calculator.calculate(grossIncome, expensesWrapper)
}

function wrapExpenses(expenses: Expenses) {
  if (expenses.percentage) {
    return new PercentageExpensesWrapper(expenses.percentage)
  }

  if (expenses.amount) {
    return new FixedExpensesWrapper(expenses.amount)
  }

  throw new Error('Expenses must have a property "percentage" or "amount"')
}
