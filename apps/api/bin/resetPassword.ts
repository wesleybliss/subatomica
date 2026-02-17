#!/usr/bin/env node

import 'dotenv/config'
import { auth } from '../src/services/auth'

async function resetPassword(email: string, newPassword: string) {
    const ctx = await auth.$context
    const userResult = await ctx.internalAdapter.findUserByEmail(email, { includeAccounts: true })
    
    if (!userResult?.user) {
        throw new Error(`No user found for email: ${email}`)
    }
    
    const hashedPassword = await ctx.password.hash(newPassword)
    const accounts = await ctx.internalAdapter.findAccounts(userResult.user.id)
    
    // Find any account that might have a password (password or credential provider)
    const passwordAccounts = accounts.filter(account => ['password', 'credential'].includes(account.providerId))
    
    if (passwordAccounts.length === 0) {
        console.log(`No existing password account found. Creating a new 'credential' account for ${email}.`)
        await ctx.internalAdapter.createAccount({
            userId: userResult.user.id,
            providerId: 'credential',
            accountId: userResult.user.id,
            password: hashedPassword,
        })
    } else {
        console.log(`Updating ${passwordAccounts.length} account(s) for ${email}.`)
        for (const account of passwordAccounts) {
            console.log(`Updating account: ${account.providerId} (${account.id})`)
            // updatePassword in some adapters expects the record ID, in others it might be userId
            // We'll try to update the record directly if we can't be sure, but let's stick to updatePassword
            // Actually, ctx.internalAdapter.updatePassword(userId, password) is standard in v1
            await ctx.internalAdapter.updatePassword(userResult.user.id, hashedPassword)
        }
    }
}

const [email, ...rest] = process.argv.slice(2)
const newPassword = rest.join(' ')

if (!email || !newPassword) {
    console.error('Usage: pnpm tsx bin/resetPassword.ts <email> <newPassword>')
    process.exit(1)
}

resetPassword(email, newPassword)
    .then(() => {
        console.log('Password reset successful')
        process.exit(0)
    })
    .catch(error => {
        console.error('Password reset failed:', error)
        process.exit(1)
    })
