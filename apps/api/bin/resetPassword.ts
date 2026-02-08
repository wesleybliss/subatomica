#!/usr/bin/env node

import 'dotenv/config'

import { auth } from '../lib/auth'

async function resetPassword(email: string, newPassword: string) {
    const ctx = await auth.$context
    const userResult = await ctx.internalAdapter.findUserByEmail(email, { includeAccounts: true })
    
    if (!userResult?.user) {
        throw new Error(`No user found for email: ${email}`)
    }
    
    const hashedPassword = await ctx.password.hash(newPassword)
    const accounts = await ctx.internalAdapter.findAccounts(userResult.user.id)
    const credentialAccount = accounts.find(account => account.providerId === 'credential')
    
    if (!credentialAccount) {
        await ctx.internalAdapter.createAccount({
            userId: userResult.user.id,
            providerId: 'credential',
            accountId: userResult.user.id,
            password: hashedPassword,
        })
    } else {
        await ctx.internalAdapter.updatePassword(userResult.user.id, hashedPassword)
    }
}

const [email, newPassword] = process.argv.slice(2)

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
