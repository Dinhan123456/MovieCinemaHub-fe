import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Star, Calendar, Clock } from 'lucide-react'

// Dữ liệu từ backend
const API_BASE = 'http://127.0.0.1:8080/api'

const MovieCard = ({ movie, onBookTicket, disabled, onLogin }) => {
  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-purple-500/20">
      <div className="relative overflow-hidden">
        <img 
          src={movie.image} 
          alt={movie.title}
          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
          <Star className="w-4 h-4 fill-current" />
          {movie.rating}
        </div>
        
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium">
          {movie.year}
        </div>
        
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {disabled ? (
            <Button 
              onClick={onLogin}
              className="bg-gray-600 hover:bg-gray-700 text-white shadow hover:shadow-md"
            >
              Đăng nhập để đặt
            </Button>
          ) : (
            <Button 
              onClick={() => onBookTicket(movie)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              🎬 Đặt Vé Ngay
            </Button>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold line-clamp-1 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
          {movie.title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 font-medium">
          {movie.originalTitle}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
          {movie.genre.map((g, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 font-medium px-3 py-1"
            >
              {g}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{movie.duration}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 text-green-500" />
            <span className="font-medium">{movie.showtimes.length} suất</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 line-clamp-2 mb-6 leading-relaxed">
          {movie.description}
        </p>
        
        <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {movie.price.toLocaleString('vi-VN')} VNĐ
          </div>
          {disabled ? (
            <Button 
              onClick={onLogin}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2"
            >
              Đăng nhập để đặt
            </Button>
          ) : (
            <Button 
              onClick={() => onBookTicket(movie)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 py-2"
            >
              🎫 Đặt Vé
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function HomePage({ onBookTicket, isAuthed, onRequireLogin }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Tất cả')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/movies`)
        if (!res.ok) throw new Error('Không tải được danh sách phim')
        const data = await res.json()
        setMovies(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const genres = ['Tất cả', ...new Set(movies.flatMap(movie => movie.genre || []))]

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.originalTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = selectedGenre === 'Tất cả' || movie.genre.includes(selectedGenre)
    return matchesSearch && matchesGenre
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        Đang tải danh sách phim...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      {/* Header */}
      <header className="backdrop-blur-md shadow-lg sticky top-0 z-50" style={{ backgroundColor: 'rgba(17,17,17,0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>
                  CinemaHub
                </h1>
                <p className="mt-1 text-lg" style={{ color: '#8B8D98' }}>Khám phá những bộ phim hay nhất</p>
              </div>
            </div>
            <div className="text-sm px-4 py-2 rounded-full backdrop-blur-sm" style={{ color: '#8B8D98', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              📅 Hôm nay: {new Date().toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="🔍 Tìm kiếm phim yêu thích..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  onClick={() => setSelectedGenre(genre)}
                  className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedGenre === genre 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                      : 'bg-white/50 text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {genre}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-700">
                🎬 Tìm thấy <span className="text-blue-600 font-bold">{filteredMovies.length}</span> phim
              </div>
              <div className="text-sm text-gray-500">
                Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}
              </div>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredMovies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onBookTicket={(m) => (isAuthed ? onBookTicket(m) : onRequireLogin?.())}
              disabled={!isAuthed}
              onLogin={onRequireLogin}
            />
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 max-w-md mx-auto">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-gray-600 text-xl font-semibold mb-2">Không tìm thấy phim nào</p>
              <p className="text-gray-400 text-sm">Thử thay đổi từ khóa tìm kiếm hoặc thể loại</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
