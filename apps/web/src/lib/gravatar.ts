import { cache } from 'react'
import { MD5 } from 'crypto-js'

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const getGravatarUrl = cache((email: string, size = 96) => {
    
    const normalizedEmail = normalizeEmail(email)
    const hash = MD5(normalizedEmail).toString()
    const fallback = 'identicon'
    
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${fallback}`
    
})
