export interface NetSalaryResults {
  /** The health insurance contributions for the employee and employer */
  health: { employee: number; employer: number }
  /** The total income tax, including both normal and high rates and the credit */
  incomeTax: number
  /** The income tax calculated using the high rate */
  incomeTaxHighRate: number
  /** The income tax calculated using the normal rate */
  incomeTaxNormalRate: number
  /** The net salary after taxes and insurance */
  netSalary: number
  /** The social insurance contributions for the employee and employer */
  social: { employee: number; employer: number }
}
