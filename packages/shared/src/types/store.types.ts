import type { FnsWire, StateWire } from '@forminator/react-wire'

export type StringArrayWireValue = StateWire<string[]>
export type StringArrayWireFn = FnsWire<(value: string[]) => void>
export type StringArrayWire = StringArrayWireValue & StringArrayWireFn
