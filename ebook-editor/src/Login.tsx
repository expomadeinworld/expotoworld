import React, { useState } from 'react'
import axios from 'axios'
import { AUTH_BASE, setAccessToken, setRefreshToken } from './auth'

export default function Login({ onToken }: { onToken: (t: string) => void }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<0|1>(0)
  const [error, setError] = useState('')
  const AUTH_BASE = import.meta.env.VITE_AUTH_BASE || 'https://device-api.expotoworld.com'

  const sendCode = async () => {
    setError('')
    try {
      await axios.post(`${AUTH_BASE}/api/auth/send-verification`, { email }, { headers: { 'X-Require-Existing': 'true', 'X-Require-Role': 'Author' } })
      setStep(1)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send code')
    }
  }

  const verify = async () => {
    setError('')
    try {
      const res = await axios.post(`${AUTH_BASE}/api/auth/verify-code`, { email, code }, { headers: { 'X-Require-Existing': 'true', 'X-Require-Role': 'Author' } })
      const token: string = res.data?.token
      const role: string = res.data?.user?.role
      const refreshToken: string | undefined = res.data?.refresh_token
      const refreshExpiresAt: string | undefined = res.data?.refresh_expires_at
      if (role !== 'Author') {
        setError('This interface is restricted to Author users')
        return
      }
      if (token) setAccessToken(token, res.data?.expires_at)
      if (refreshToken) setRefreshToken(refreshToken, refreshExpiresAt)
      onToken(token)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Verification failed')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '72px auto' }}>
      <h3>Ebook Editor Login</h3>
      <p>Author-only access</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {step === 0 && (
        <div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: 8 }} />
          <button style={{ marginTop: 12 }} onClick={sendCode}>Send code</button>
        </div>
      )}
      {step === 1 && (
        <div>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="6-digit code" style={{ width: '100%', padding: 8 }} />
          <button style={{ marginTop: 12 }} onClick={verify}>Verify</button>
        </div>
      )}
    </div>
  )
}

