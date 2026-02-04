import { cache } from 'react'
import { createHash } from 'crypto'

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const getGravatarUrl = cache((email: string, size = 96) => {
    const normalizedEmail = normalizeEmail(email)
    const hash = createHash('md5').update(normalizedEmail).digest('hex')
    const fallback = 'identicon'
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${fallback}`
})
