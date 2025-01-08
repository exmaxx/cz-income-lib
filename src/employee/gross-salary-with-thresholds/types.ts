import { ThresholdKey } from '../enums'
import { Modifiers } from '../../types'

export interface ModifiersGetter {
  get(thresholds: ThresholdKey[]): Modifiers
}
