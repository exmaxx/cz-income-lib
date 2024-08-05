import {
  calculateFreelancerNetIncome,
  calculateEmployeeNetSalary,
  calculateFreelancerGrossIncome,
  calculateEmployeeGrossSalary,
} from './index'

describe('index', () => {
  it('exports "calculateFreelancerNetIncome" function', () => {
    expect(calculateFreelancerNetIncome).toBeDefined()
  })

  it('exports "calculateFreelancerGrossIncome" function', () => {
    expect(calculateFreelancerGrossIncome).toBeDefined()
  })

  it('exports "calculateEmployeeNetSalary" function', () => {
    expect(calculateEmployeeNetSalary).toBeDefined()
  })

  it('exports "calculateEmployeeGrossSalary" function', () => {
    expect(calculateEmployeeGrossSalary).toBeDefined()
  })
})
