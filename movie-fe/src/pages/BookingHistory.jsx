import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock, MapPin, Users, Ticket, Search } from 'lucide-react'

const API_BASE = 'http://127.0.0.1:8080/api'

export default function BookingHistory({ onBack }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('Tất cả')

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vui lòng đăng nhập để xem lịch sử đặt vé')
        return
      }

      // Đọc từ localStorage thay vì API (để demo)
      const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]')
      setBookings(userBookings)
    } catch (e) {
      console.error('Error loading bookings:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Đã xác nhận</Badge>
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Đã hủy</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Chờ xác nhận</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.movie?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'Tất cả' || booking.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
        <div className="text-white text-xl">Đang tải lịch sử đặt vé...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
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
                <p className="mt-1 text-lg" style={{ color: '#8B8D98' }}>Lịch sử đặt vé</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={onBack}
                className="px-3 py-1.5 text-sm rounded-lg border-2 transition" 
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#8B8D98' }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm theo tên phim hoặc mã vé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {['Tất cả', 'CONFIRMED', 'PENDING', 'CANCELLED'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    filterStatus === status 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                      : 'bg-white/50 text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {status === 'Tất cả' ? 'Tất cả' : 
                   status === 'CONFIRMED' ? 'Đã xác nhận' :
                   status === 'PENDING' ? 'Chờ xác nhận' : 'Đã hủy'}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-700">
                🎫 Tìm thấy <span className="text-blue-600 font-bold">{filteredBookings.length}</span> vé đã đặt
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="bg-white/70 backdrop-blur-sm shadow-xl border-0 border border-white/20">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ticket className="w-6 h-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          {booking.movie?.title || 'Phim không xác định'}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Mã vé: <span className="font-mono font-bold text-purple-600">{booking.bookingCode}</span>
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày đặt</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500">Suất chiếu</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.showtime?.startTime).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-500">Ghế ngồi</p>
                        <p className="font-semibold text-gray-900">
                          {booking.seats?.join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="font-semibold text-gray-900">
                          {booking.totalPrice?.toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Khách hàng</p>
                        <p className="font-semibold text-gray-900">{booking.customerName}</p>
                        <p className="text-sm text-gray-500">{booking.customerEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="font-semibold text-gray-900">{booking.customerPhone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 max-w-md mx-auto">
                <div className="text-6xl mb-4">🎫</div>
                <p className="text-gray-600 text-xl font-semibold mb-2">Chưa có vé nào</p>
                <p className="text-gray-400 text-sm">Bạn chưa đặt vé nào hoặc không tìm thấy vé phù hợp</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
