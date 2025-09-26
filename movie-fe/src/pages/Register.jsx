import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AuthAPI } from '@/api/http'

export default function Register({ onSuccess }) {
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    // client validate
    const eobj = {}
    if (!form.username || /\s/.test(form.username)) eobj.username = 'Tài khoản không để trống và không chứa khoảng trắng'
    if (!form.password || form.password.length > 16) eobj.password = 'Mật khẩu không để trống và tối đa 16 ký tự'
    if (!form.fullName) eobj.fullName = 'Họ tên không để trống'
    if (!/^[^@\s]+@gmail\.com$/.test(form.email)) eobj.email = 'Email phải có đuôi @gmail.com'
    setErrors(eobj)
    if (Object.keys(eobj).length) return
    try {
      setLoading(true)
      await AuthAPI.register(form)
      onSuccess?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-24 -left-24 w-96 h-96 rotate-12" style={{ background: 'linear-gradient(135deg, #201124 0%, #8A31AA 60%)', filter: 'blur(40px)', borderRadius: '32px' }}></div>
        <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] -rotate-12" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #8B8D98 70%)', filter: 'blur(40px)', borderRadius: '32px' }}></div>
      </div>

      <form onSubmit={submit} className="relative w-full max-w-lg">
        <div className="rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.12)' }}>
          <h1 className="text-3xl font-extrabold text-center mb-8 text-white">Đăng ký</h1>
          {error && <div className="text-red-400 text-sm mb-3 text-center">{error}</div>}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#8B8D98' }}>Tài khoản</label>
              <Input value={form.username} onChange={(e)=>setForm({ ...form, username: e.target.value })}
                     className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-[#8A31AA]" />
              {errors.username && <div className="text-red-400 text-xs mt-1">{errors.username}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#8B8D98' }}>Mật khẩu</label>
              <Input type="password" value={form.password} onChange={(e)=>setForm({ ...form, password: e.target.value })}
                     className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-[#8A31AA]" />
              {errors.password && <div className="text-red-400 text-xs mt-1">{errors.password}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#8B8D98' }}>Họ tên</label>
              <Input value={form.fullName} onChange={(e)=>setForm({ ...form, fullName: e.target.value })}
                     className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-[#8A31AA]" />
              {errors.fullName && <div className="text-red-400 text-xs mt-1">{errors.fullName}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#8B8D98' }}>Email</label>
              <Input value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })}
                     className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-[#8A31AA]" />
              {errors.email && <div className="text-red-400 text-xs mt-1">{errors.email}</div>}
            </div>
          </div>

          <Button type="submit" className="w-full mt-7 h-11 text-white shadow-lg hover:shadow-xl transition" disabled={loading}
                  style={{ background: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>
        </div>
      </form>
    </div>
  )
}


