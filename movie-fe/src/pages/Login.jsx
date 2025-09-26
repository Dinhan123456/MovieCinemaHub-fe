import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AuthAPI } from '@/api/http'

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      setLoading(true)
      await AuthAPI.login(username.trim(), password)
      onSuccess?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-24 -left-24 w-96 h-96 rotate-12" style={{ background: 'linear-gradient(135deg, #201124 0%, #8A31AA 60%)', filter: 'blur(40px)', borderRadius: '32px' }}></div>
        <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] -rotate-12" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #8B8D98 70%)', filter: 'blur(40px)', borderRadius: '32px' }}></div>
      </div>
      <form onSubmit={submit} className="relative w-full max-w-lg">
        <div className="rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.12)' }}>
          <h1 className="text-3xl font-extrabold text-center mb-8 text-white">Đăng nhập</h1>
          {error && <div className="text-red-400 text-sm mb-3 text-center">{error}</div>}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#8B8D98' }}>Tài khoản</label>
              <Input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="username"
                     className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-[#8A31AA]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#8B8D98' }}>Mật khẩu</label>
              <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="******"
                     className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-[#8A31AA]" />
            </div>
          </div>
          <Button type="submit" className="w-full mt-7 h-11 text-white shadow-lg hover:shadow-xl transition" disabled={loading}
                  style={{ background: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </div>
      </form>
    </div>
  )
}


