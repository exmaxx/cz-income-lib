import type { Expenses, Rates as FreelancerRates } from './freelancer/types'
import type { Rates as EmployeeRates } from './employee/types'
import { NetIncomeResults } from './freelancer/net-income/types'
import { NetSalaryResults } from './employee/net-salary/types'
import GrossIncomeCalculator from './freelancer/gross-income/GrossIncomeCalculator'
import NetIncomeCalculator from './freelancer/net-income/NetIncomeCalculator'
import PercentageExpensesWrapper from './freelancer/expenses/PercentageExpensesWrapper'
import FixedExpensesWrapper from './freelancer/expenses/FixedExpensesWrapper'
import NetSalaryCalculator from './employee/net-salary/NetSalaryCalculator'
import SocialCalculator from './employee/net-salary/social/SocialCalculator'
import HealthCalculator from './employee/net-salary/health/HealthCalculator'
import TaxCalculator from './employee/net-salary/tax/TaxCalculator'
import GrossSalaryCalculator from './employee/gross-salary/GrossSalaryCalculator'

export type { FreelancerRates, EmployeeRates }

export function calculateEmployeeNetSalary(salary: number, rates: EmployeeRates): NetSalaryResults {
  const { incomeRates, socialRates, healthRates } = rates

  const socialCalculator = new SocialCalculator(socialRates)
  const healthCalculator = new HealthCalculator(healthRates)
  const taxCalculator = new TaxCalculator(incomeRates)
  const netSalaryCalculator = new NetSalaryCalculator(socialCalculator, healthCalculator, taxCalculator)

  return netSalaryCalculator.calculate(salary)
}

export function calculateEmployeeGrossSalary(netSalary: number, rates: EmployeeRates): number {
  const grossSalaryCalculator = GrossSalaryCalculator.create(rates)

  return grossSalaryCalculator.calculate(netSalary)
}

export function calculateFreelancerGrossIncome(netIncome: number, expenses: Expenses, rates: FreelancerRates): number {
  const grossIncomeCalculator = new GrossIncomeCalculator(rates)
  const expensesWrapper = wrapExpenses(expenses)

  return grossIncomeCalculator.calculate(netIncome, expensesWrapper)
}

export function calculateFreelancerNetIncome(
  grossIncome: number,
  expenses: Expenses,
  rates: FreelancerRates
): NetIncomeResults {
  const netIncomeCalculator = new NetIncomeCalculator(rates)
  const expensesWrapper = wrapExpenses(expenses)

  return netIncomeCalculator.calculate(grossIncome, expensesWrapper)
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
