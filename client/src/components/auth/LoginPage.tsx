// client/src/components/auth/LoginPage.tsx
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Separator } from '../ui/separator'
import { Alert, AlertDescription } from '../ui/alert'
import {
  IoCalculatorOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoMailOutline,
  IoSparklesOutline,
} from 'react-icons/io5'
import { login as apiLogin, type LoginResponse } from '../../lib/api'

type User = LoginResponse['user']

interface LoginPageProps {
  onLogin: (user?: User) => void
  onNavigateToRegister?: () => void
}

export default function LoginPage({
  onLogin,
  onNavigateToRegister,
}: LoginPageProps) {
  const [email, setEmail] = useState<string>('john@acme.com')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const extractMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    return 'Unable to sign in. Please try again.'
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    setIsLoading(true)
    try {
      const { user } = await apiLogin({ email: email.trim(), password })
      onLogin(user)
    } catch (err: unknown) {
      setError(extractMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute top-20 left-20 w-32 h-32 rounded-full blur-xl animate-pulse"
          style={{ backgroundColor: 'rgba(13, 0, 164, 0.1)' }}
        />
        <div
          className="absolute top-40 right-32 w-24 h-24 rounded-full blur-xl animate-pulse delay-300"
          style={{ backgroundColor: 'rgba(34, 0, 124, 0.15)' }}
        />
        <div
          className="absolute bottom-32 left-48 w-40 h-40 rounded-full blur-xl animate-pulse delay-700"
          style={{ backgroundColor: 'rgba(20, 1, 82, 0.1)' }}
        />
        <div
          className="absolute bottom-48 right-20 w-28 h-28 rounded-full blur-xl animate-pulse delay-500"
          style={{ backgroundColor: 'rgba(4, 5, 46, 0.1)' }}
        />
      </div>

      {/* Main */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-12 w-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <IoCalculatorOutline
                  className="h-7 w-7 text-white"
                  aria-hidden="true"
                />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                  BudgetPro
                </h1>
                <p className="text-xs text-white">Smart Finance Management</p>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-background">
                Welcome back
              </h2>
              <p className="text-background">
                Sign in to your account to continue managing your finances
              </p>
            </div>
          </div>

          {/* Form Card */}
          <Card className="shadow-xl border-0 bg-background/80 backdrop-blur-md">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <IoSparklesOutline
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                Sign In
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <IoMailOutline
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-smooth"
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-border/50 focus:border-primary/50 focus:shadow-glow transition-smooth"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 h-12 border-border/50 focus:border-primary/50 focus:shadow-glow transition-smooth"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <IoEyeOffOutline className="h-4 w-4" />
                      ) : (
                        <IoEyeOutline className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert
                    variant="destructive"
                    className="animate-scale-in"
                    role="alert"
                  >
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 gradient-primary hover:shadow-glow transition-smooth hover-lift font-medium cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
              </div>

              <div className="text-center space-y-4">
                <Button
                  variant="link"
                  className="text-sm text-muted-foreground hover:text-primary transition-smooth cursor-pointer"
                >
                  Forgot your password?
                </Button>
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm text-primary hover:text-primary/80 transition-smooth cursor-pointer"
                    onClick={onNavigateToRegister}
                  >
                    Sign up for free
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-background mt-8 space-y-2">
            <p>
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
            <div className="flex items-center justify-center gap-4">
              <span>Trusted by 10,000+ businesses</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 w-1 gradient-success rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
