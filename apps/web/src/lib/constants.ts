// @ts-expect-error @todo add types
import * as rwp from 'react-wire-persisted'

const { key, getPrefixedKeys } = rwp.utils

export const NS = 'subatomica'

// Application
key('primarySidebarWidth')

// Project
key('collapsedLanes')

const prefixedKeys = getPrefixedKeys(NS)

export { prefixedKeys as keys }
