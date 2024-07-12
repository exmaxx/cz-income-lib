import { calculateFreelancer, calculateEmployee } from './index'

describe('index', () => {
  it('exports "calculateSelf" function', () => {
    expect(calculateFreelancer).toBeDefined()
  })

  it('exports "calculateEmployee" function', () => {
    expect(calculateEmployee).toBeDefined()
  })
})
