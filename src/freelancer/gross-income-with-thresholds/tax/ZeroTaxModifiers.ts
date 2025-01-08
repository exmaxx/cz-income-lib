import { ModifiersGetter } from '../types'
import { Modifiers } from '../../../types'

export class ZeroTaxModifiers implements ModifiersGetter {
  get(): Modifiers {
    return {
      amount: 0,
      rate: 0,
    }
  }
}
