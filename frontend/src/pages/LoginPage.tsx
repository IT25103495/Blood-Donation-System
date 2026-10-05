import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, getErrorMessage } from '../api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { AuthSplitLayout } from '../layouts/AuthSplitLayout'

type LoginValues = { username: string; password: string }

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ defaultValues: { username: '', password: '' } })

  const submit = async (values: LoginValues) => {
    setError(null)
    try {
      const result = await authApi.login(values)
      login(result.token, result.role, result.adminType, result.userID)
      const role = result.role.replace('ROLE_', '').toUpperCase()
      if (role === 'DONOR') navigate('/donor', { replace: true })
      else if (role === 'HOSTER') navigate('/hoster', { replace: true })
      else if (role === 'HOSPITAL') navigate('/hospital', { replace: true })
      else if (role === 'ADMIN' && result.adminType === 'DOCTOR') navigate('/staff', { replace: true })
      else navigate('/admin', { replace: true })
    } catch (err: unknown) { setError(getErrorMessage(err)) }
  }

  return <AuthSplitLayout
    panel="left"
    headline={<>Every donation<br />helps someone recover.</>}
    body="Sign in to book a donation, follow a campaign, or manage your organisation."
  >
    <h1 className="app-title text-3xl font-bold text-slate-950">Welcome back</h1>
    <p className="mt-2 text-slate-600">Sign in to your Lifeline account to continue.</p>
    {error && <div role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    <form className="mt-8 space-y-5" onSubmit={handleSubmit(submit)}>
      <Input label="Username" id="username" autoComplete="username" error={errors.username?.message} {...register('username', { required: 'Enter your username.' })} />
      <div className="relative">
        <Input label="Password" id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" error={errors.password?.message} {...register('password', { required: 'Enter your password.' })} />
        <button type="button" className="absolute right-3 top-9 text-slate-500 hover:text-slate-900" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>
      <Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'}</Button>
    </form>
    <p className="mt-8 text-center text-sm text-slate-600">Don't have an account? <Link className="font-semibold text-red-700 hover:text-red-800" to="/register">Sign up</Link></p>
  </AuthSplitLayout>
}
