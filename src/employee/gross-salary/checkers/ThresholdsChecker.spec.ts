import { ThresholdsChecker } from './ThresholdsChecker'
import { rates } from '../../fixtures'
import { Thresholds } from '../../enums'

describe('ThresholdsChecker', () => {
  const thresholdsChecker = new ThresholdsChecker(rates)

  describe('check()', () => {
    it.each([18000, 3000, 2000])('detects minimal health insurance for gross salary %i', (grossSalaryMonthly) => {
      // Act
      const reachedThresholds = thresholdsChecker.check(grossSalaryMonthly * 12)

      // Assert
      expect(reachedThresholds.has(Thresholds.MIN_HEALTH)).toBe(true)
    })

    it.each([3000, 2000])('detects zero tax (for gross salary %i)', (grossSalaryMonthly) => {
      // Act
      const reachedThresholds = thresholdsChecker.check(grossSalaryMonthly * 12)

      // Assert
      expect(reachedThresholds.has(Thresholds.ZERO_TAX)).toBe(true)
    })

    it('detects high tax', () => {
      // Arrange
      const grossSalaryMonthly = 170000

      // Act
      const reachedThresholds = thresholdsChecker.check(grossSalaryMonthly * 12)

      // Assert
      expect(reachedThresholds.has(Thresholds.HIGH_TAX)).toBe(true)
    })
  })

  it('detects maximum social base', () => {
    // Arrange
    const grossSalaryMonthly = 300000

    // Act
    const reachedThresholds = thresholdsChecker.check(grossSalaryMonthly * 12)

    // Assert
    expect(reachedThresholds.has(Thresholds.MAX_BASE_SOCIAL)).toBe(true)
  })
})
