import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const API = 'http://127.0.0.1:8080/api'

export default function MovieDetail({ movieId, onSelectShowtime }) {
  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [mRes, stRes] = await Promise.all([
          fetch(`${API}/movies/${movieId}`),
          fetch(`${API}/movies/${movieId}/showtimes`),
        ])
        if (!mRes.ok) throw new Error('Không tải được phim')
        if (!stRes.ok) throw new Error('Không tải được lịch chiếu')
        setMovie(await mRes.json())
        const sts = await stRes.json()
        setShowtimes(sts)
        // pick first date as default
        const first = sts[0]
        if (first) setSelectedDate(new Date(first.startTime).toISOString().slice(0,10))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [movieId])

  if (loading) return <div className="p-6 text-gray-400">Đang tải...</div>
  if (error) return <div className="p-6 text-red-400">{error}</div>
  if (!movie) return null

  // group showtimes by date (yyyy-MM-dd)
  const groups = showtimes.reduce((acc, st) => {
    const d = new Date(st.startTime).toISOString().slice(0,10)
    acc[d] = acc[d] || []
    acc[d].push(st)
    return acc
  }, {})
  const dates = Object.keys(groups).sort()
  const currentList = groups[selectedDate] || []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2">{movie.title}</h1>
        <p className="text-gray-400">{movie.originalTitle}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {(movie.genre || []).map((g, i) => (
            <Badge key={i} className="bg-white/10 border-0 text-white">{g}</Badge>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-6 backdrop-blur-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.12)' }}>
        <h2 className="text-xl font-bold text-white mb-4">Chọn suất chiếu</h2>
        {/* Date tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {dates.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedDate===d ? 'text-white' : 'text-gray-400'}`}
              style={selectedDate===d ? { background: 'linear-gradient(90deg, #8A31AA, #8B8D98)'} : { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)'}}
            >
              {new Date(d).toLocaleDateString('vi-VN', { weekday:'short', day:'2-digit', month:'2-digit' })}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentList.map(st => (
            <div key={st.id} className="p-4 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-between">
              <div>
                <div className="font-semibold">{new Date(st.startTime).toLocaleTimeString('vi-VN')}</div>
                <div className="text-sm text-gray-400">Phòng: {st.auditorium || '—'} • Giá: {st.price?.toLocaleString('vi-VN')} đ</div>
              </div>
              <Button onClick={() => onSelectShowtime(st, currentList)} className="text-white" style={{ background: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>Chọn</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


