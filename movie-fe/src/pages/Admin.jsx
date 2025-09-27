import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const API = 'http://127.0.0.1:8080/api/admin'

export default function Admin() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // movie object
  const [showtimes, setShowtimes] = useState([])
  const [stForm, setStForm] = useState({ startTime: '', price: 100000, auditorium: '' })

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const loadMovies = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API}/movies`, {
        headers: getHeaders()
      })
      if (!res.ok) throw new Error('Không tải được phim')
      setMovies(await res.json())
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  useEffect(() => { loadMovies() }, [])

  const selectMovie = async (m) => {
    setEditing(m)
    try {
      const res = await fetch(`${API}/movies/${m.id}/showtimes`, {
        headers: getHeaders()
      })
      if (res.ok) setShowtimes(await res.json())
    } catch {}
  }

  const emptyMovie = { title:'', originalTitle:'', year:2025, genre:'', rating:8.0, duration:'120 phút', image:'', description:'', price:120000, showtimes:[] }

  const saveMovie = async () => {
    // Xử lý genre - có thể là string (từ input) hoặc array (từ backend)
    let genreArray = [];
    if (Array.isArray(editing.genre)) {
      // Nếu là array từ backend, giữ nguyên
      genreArray = editing.genre;
    } else if (typeof editing.genre === 'string') {
      // Nếu là string từ input, split thành array
      genreArray = editing.genre.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    const payload = { ...editing, genre: genreArray }
    const method = editing.id ? 'PUT' : 'POST'
    const url = editing.id ? `${API}/movies/${editing.id}` : `${API}/movies`
    
    try {
      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(payload) })
      if (!res.ok) { 
        const errorText = await res.text();
        console.error('Lưu phim thất bại:', errorText);
        window.appToast?.('Lưu phim thất bại'); 
        return 
      }
      window.appToast?.('Lưu phim thành công')
      await loadMovies()
      if (!editing.id) setEditing(null)
    } catch (error) {
      console.error('Lỗi khi lưu phim:', error);
      window.appToast?.('Lưu phim thất bại - Lỗi kết nối');
    }
  }

  const removeMovie = async (id) => {
    if (!confirm('Xóa phim?')) return
    const res = await fetch(`${API}/movies/${id}`, { method:'DELETE', headers: getHeaders() })
    if (res.ok) { window.appToast?.('Đã xóa phim'); await loadMovies(); setEditing(null); setShowtimes([]) }
  }

  const addShowtime = async () => {
    if (!editing?.id) return
    const res = await fetch(`${API}/movies/${editing.id}/showtimes`, { method:'POST', headers: getHeaders(), body: JSON.stringify(stForm) })
    if (!res.ok) { window.appToast?.('Thêm suất thất bại'); return }
    window.appToast?.('Đã thêm suất')
    setStForm({ startTime:'', price: 100000, auditorium:'' })
    const r = await fetch(`${API}/movies/${editing.id}/showtimes`, { headers: getHeaders() })
    if (r.ok) setShowtimes(await r.json())
  }

  const updateShowtime = async (st) => {
    const res = await fetch(`${API.replace('/admin','')}/admin/showtimes/${st.id}`, { method:'PUT', headers: getHeaders(), body: JSON.stringify(st) })
    if (!res.ok) window.appToast?.('Lưu suất thất bại'); else window.appToast?.('Lưu suất thành công')
  }

  const deleteShowtime = async (id) => {
    if (!confirm('Xóa suất chiếu?')) return
    const res = await fetch(`${API.replace('/admin','')}/admin/showtimes/${id}`, { method:'DELETE', headers: getHeaders() })
    if (res.ok) { window.appToast?.('Đã xóa suất'); setShowtimes(showtimes.filter(s=>s.id!==id)) }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-extrabold mb-6">Admin • Quản lý Phim & Suất chiếu</h1>
      {error && <div className="text-red-400 mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Movies list */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl p-4 backdrop-blur-xl" style={{ background:'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))', border:'1px solid rgba(255,255,255,0.12)'}}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Danh sách phim</h2>
              <Button onClick={()=>{ setEditing({ ...emptyMovie }); setShowtimes([]) }} style={{ background:'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>+ Thêm</Button>
            </div>
            {loading ? <div className="text-gray-400">Đang tải...</div> : (
              <ul className="space-y-2">
                {movies.map(m => (
                  <li key={m.id} className={`p-2 rounded flex justify-between items-center ${editing?.id===m.id?'bg-white/10':'bg-white/5'}`}>
                    <button onClick={()=>selectMovie(m)} className="text-left">
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-xs text-gray-400">{m.year}</div>
                    </button>
                    <Button onClick={()=>removeMovie(m.id)} className="text-white" style={{ background:'linear-gradient(90deg, #8A31AA, #8B8D98)'}}>Xóa</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Movie editor + showtimes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl p-6 backdrop-blur-xl" style={{ background:'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))', border:'1px solid rgba(255,255,255,0.12)'}}>
            <h2 className="text-xl font-bold mb-4">Thông tin phim</h2>
            {!editing ? <div className="text-gray-400">Chọn một phim bên trái hoặc bấm “+ Thêm”</div> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Tiêu đề</label>
                  <Input className="bg-white/5 border-white/10 text-white" value={editing.title} onChange={e=>setEditing({...editing, title:e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Tên gốc</label>
                  <Input className="bg-white/5 border-white/10 text-white" value={editing.originalTitle||''} onChange={e=>setEditing({...editing, originalTitle:e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Năm</label>
                  <Input className="bg-white/5 border-white/10 text-white" type="number" value={editing.year||2025} onChange={e=>setEditing({...editing, year:Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Thể loại (phân tách bằng dấu phẩy)</label>
                  <Input className="bg-white/5 border-white/10 text-white" value={Array.isArray(editing.genre)?editing.genre.join(', '):(editing.genre||'')} onChange={e=>setEditing({...editing, genre:e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-400">Ảnh poster URL</label>
                  <Input className="bg-white/5 border-white/10 text-white" value={editing.image||''} onChange={e=>setEditing({...editing, image:e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-400">Mô tả</label>
                  <textarea className="w-full p-2 rounded bg-white/5 border border-white/10 text-white" rows={4} value={editing.description||''} onChange={e=>setEditing({...editing, description:e.target.value})}></textarea>
                </div>
                <div className="sm:col-span-2 flex gap-2 justify-end">
                  <Button onClick={saveMovie} className="text-white" style={{ background:'linear-gradient(90deg, #8A31AA, #8B8D98)'}}>Lưu phim</Button>
                </div>
              </div>
            )}
          </div>

          {editing && (
            <div className="rounded-2xl p-6 backdrop-blur-xl" style={{ background:'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))', border:'1px solid rgba(255,255,255,0.12)'}}>
              <h2 className="text-xl font-bold mb-4">Suất chiếu</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                <Input type="datetime-local" className="bg-white/5 border-white/10 text-white" value={stForm.startTime} onChange={e=>setStForm({...stForm, startTime:e.target.value})} />
                <Input type="number" className="bg-white/5 border-white/10 text-white" value={stForm.price} onChange={e=>setStForm({...stForm, price:Number(e.target.value)})} />
                <Input placeholder="Phòng" className="bg-white/5 border-white/10 text-white" value={stForm.auditorium} onChange={e=>setStForm({...stForm, auditorium:e.target.value})} />
                <Button onClick={addShowtime} className="text-white" style={{ background:'linear-gradient(90deg, #8A31AA, #8B8D98)'}}>+ Thêm suất</Button>
              </div>
              <table className="w-full text-sm">
                <thead className="text-gray-400">
                  <tr>
                    <th className="text-left py-2">Thời gian</th>
                    <th className="text-left">Giá</th>
                    <th className="text-left">Phòng</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {showtimes.map(st => (
                    <tr key={st.id} className="border-t border-white/10">
                      <td className="py-2">
                        <Input type="datetime-local" className="bg-white/5 border-white/10 text-white" value={toLocalInput(st.startTime)} onChange={e=>{ st.startTime = e.target.value; setShowtimes([...showtimes]) }} onBlur={()=>updateShowtime(st)} />
                      </td>
                      <td>
                        <Input type="number" className="bg-white/5 border-white/10 text-white" value={st.price} onChange={e=>{ st.price = Number(e.target.value); setShowtimes([...showtimes]) }} onBlur={()=>updateShowtime(st)} />
                      </td>
                      <td>
                        <Input className="bg-white/5 border-white/10 text-white" value={st.auditorium||''} onChange={e=>{ st.auditorium = e.target.value; setShowtimes([...showtimes]) }} onBlur={()=>updateShowtime(st)} />
                      </td>
                      <td className="text-right">
                        <Button onClick={()=>deleteShowtime(st.id)} className="text-white" style={{ background:'linear-gradient(90deg, #8A31AA, #8B8D98)'}}>Xóa</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function toLocalInput(iso) {
  // format ISO string to yyyy-MM-ddTHH:mm for input[type=datetime-local]
  const d = new Date(iso)
  const pad = (n)=> String(n).padStart(2,'0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}


