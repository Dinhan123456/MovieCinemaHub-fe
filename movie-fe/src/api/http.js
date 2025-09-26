const API_BASE = 'http://127.0.0.1:8080/api'

export async function fetchJson(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const data = await res.json()
      msg = data.message || JSON.stringify(data)
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export const AuthAPI = {
  async login(username, password) {
    const data = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    localStorage.setItem('roles', JSON.stringify(data.roles || []))
    return data
  },
  async register({ username, password, fullName, email }) {
    const data = await fetchJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, fullName, email })
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', username)
    return data
  },
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('roles')
  },
  getToken() { return localStorage.getItem('token') },
  getUsername() { return localStorage.getItem('username') },
}


