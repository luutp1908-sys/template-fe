import React, { useState } from 'react'
import { loginAdmin } from './useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handle(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const user = await loginAdmin(email, password)

      if (!user?.roles?.includes('admin')) {
        setError('You are not an admin')
        return
      }
      // redirect to admin root
      window.location.href = '/'
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    }
  }

  return (
    <div className="login-shell">
      <h2>Admin Login</h2>
      <form onSubmit={handle}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>
        <div>
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Sign in</button>
      </form>
    </div>
  )
}
