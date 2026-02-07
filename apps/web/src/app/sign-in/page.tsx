import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import type React from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth-client'

export default function SignInPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        
        try {
            const result = await signIn.email({
                email,
                password,
                callbackURL: `${import.meta.env.VITE_PUBLIC_APP_URL}/dashboard`,
            })
            
            if (result?.error) {
                console.error('handleSubmit (result)', result.error)
                throw new Error(result.error.message ?? 'Unknown error')
            }
            
            navigate('/dashboard')
        } catch (e) {
            console.error('handleSubmit', e)
            setError('Invalid email or password')
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign In</CardTitle>
                    <CardDescription>Enter your credentials to access your projects</CardDescription>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="pr-10"/>
                                <button
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2
                                        text-neutral-500 hover:text-neutral-900"
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" aria-hidden="true"/>
                                    ) : (
                                        <Eye className="h-4 w-4" aria-hidden="true"/>
                                    )}
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-neutral-600">
                        Don't have an account?{' '}
                        <Link href="/sign-up" className="text-neutral-900 font-medium hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
