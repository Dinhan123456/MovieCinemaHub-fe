import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, MapPin, Users, CreditCard } from 'lucide-react'

const BookingPage = ({ selectedMovie, selectedShowtime, onBack, onConfirmBooking }) => {
  const [selectedShowtimeText, setSelectedShowtimeText] = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])
  const [soldSeats, setSoldSeats] = useState(new Set())
  const [allShowtimes, setAllShowtimes] = useState([])
  const [currentSelectedShowtime, setCurrentSelectedShowtime] = useState(null)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [formErrors, setFormErrors] = useState({})

  const seatLayout = [
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'],
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'],
    ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'],
    ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
    ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'],
  ]

  const handleSeatSelect = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const totalPrice = selectedSeats.length * (selectedMovie?.price || 0)

  // Load all showtimes for the movie
  React.useEffect(() => {
    const loadShowtimes = async () => {
      try {
        if (!selectedMovie?.id) return
        const res = await fetch(`http://127.0.0.1:8080/api/movies/${selectedMovie.id}/showtimes`)
        if (!res.ok) throw new Error('Không tải được danh sách suất chiếu')
        const data = await res.json()
        setAllShowtimes(data)
        
        // Set the initially selected showtime
        if (selectedShowtime) {
          setCurrentSelectedShowtime(selectedShowtime)
          setSelectedShowtimeText(new Date(selectedShowtime.startTime).toLocaleString('vi-VN'))
        } else if (data.length > 0) {
          // If no showtime selected, pick the first one
          const firstShowtime = data[0]
          setCurrentSelectedShowtime(firstShowtime)
          setSelectedShowtimeText(new Date(firstShowtime.startTime).toLocaleString('vi-VN'))
        }
      } catch (e) {
        console.error('Error loading showtimes:', e)
      }
    }
    loadShowtimes()
  }, [selectedMovie?.id, selectedShowtime])

  // Load seat states from backend by showtimeId
  React.useEffect(() => {
    const loadSeats = async () => {
      try {
        if (!currentSelectedShowtime?.id) return
        const res = await fetch(`http://127.0.0.1:8080/api/showtimes/${currentSelectedShowtime.id}/seats`)
        if (!res.ok) throw new Error('Không tải được danh sách ghế')
        const data = await res.json()
        const sold = new Set(data.filter(s => s.sold).map(s => s.seatCode))
        setSoldSeats(sold)
      } catch (e) {
        console.error(e)
      }
    }
    loadSeats()
  }, [currentSelectedShowtime?.id])

  const validate = () => {
    const errors = {}
    if (!customerInfo.name.trim()) errors.name = 'Vui lòng nhập họ tên'
    if (!customerInfo.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Email không hợp lệ'
    if (!customerInfo.phone.match(/^[0-9]{10}$/)) errors.phone = 'Số điện thoại phải gồm đúng 10 chữ số'
    if (!currentSelectedShowtime) errors.showtime = 'Chọn suất chiếu'
    if (selectedSeats.length === 0) errors.seats = 'Chọn ít nhất 1 ghế'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Real-time validation
  const validateField = (field, value) => {
    let error = ''
    switch (field) {
      case 'name':
        if (!value.trim()) error = 'Vui lòng nhập họ tên'
        break
      case 'email':
        if (value && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) error = 'Email không hợp lệ'
        break
      case 'phone':
        if (value && !value.match(/^[0-9]{10}$/)) error = 'Số điện thoại phải gồm đúng 10 chữ số'
        break
    }
    setFormErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleBooking = async () => {
    if (!selectedShowtimeText || selectedSeats.length === 0 || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      if (!validate()) return
    }

    if (!selectedMovie || !currentSelectedShowtime) {
      alert('Vui lòng chọn phim và suất chiếu')
      return
    }

    try {
      const res = await fetch('http://127.0.0.1:8080/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: selectedMovie.id,
          showtimeId: currentSelectedShowtime.id,
          showtime: selectedShowtimeText,
          seats: selectedSeats,
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone
        })
      })
      if (!res.ok) throw new Error('Đặt vé thất bại')
      const data = await res.json()
      onConfirmBooking({
        movie: selectedMovie,
        showtime: selectedShowtimeText,
        seats: selectedSeats,
        customer: customerInfo,
        totalPrice: totalPrice,
        bookingCode: data.bookingCode
      })
    } catch (e) {
      try {
        const data = await e.response?.json()
        if (data?.status === 'VALIDATION_ERROR') {
          setFormErrors(data.errors || {})
          return
        }
      } catch {}
      alert(e.message)
    }
  }

  // Show loading if no movie data
  if (!selectedMovie) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
        <div className="text-white text-xl">Đang tải thông tin phim...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      {/* Optional: nút quay lại gọn trong nội dung */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 overflow-hidden border border-white/20">
              <div className="relative">
                <img 
                  src={selectedMovie.image} 
                  alt={selectedMovie.title}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedMovie.title}</h3>
                  <p className="text-white/80 text-sm">{selectedMovie.originalTitle}</p>
                </div>
              </div>
              
              <CardHeader className="pb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-700">{selectedMovie.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-xl">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-700">Rạp CinemaHub - Tầng 3</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMovie.genre.map((g, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 font-medium px-3 py-1"
                      >
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Showtime Selection */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 border border-white/20">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Chọn Suất Chiếu
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allShowtimes.map((st) => {
                    if (!st || !st.id) return null; // Skip invalid showtimes
                    return (
                      <Button
                        key={st.id}
                        variant={currentSelectedShowtime?.id === st.id ? "default" : "outline"}
                        onClick={() => {
                          // đổi suất → cập nhật showtime được chọn + text hiển thị và reload ghế
                          setSelectedSeats([])
                          setSoldSeats(new Set())
                          setCurrentSelectedShowtime(st)
                          setSelectedShowtimeText(new Date(st.startTime).toLocaleString('vi-VN'))
                        }}
                        className={`h-16 text-lg font-semibold transition-all duration-300 ${
                          currentSelectedShowtime?.id === st.id
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                            : 'bg-white/50 text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <div className="text-sm">🕐</div>
                          <div className="font-bold">{new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-xs opacity-75">{st.auditorium || 'Room A'}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
                {allShowtimes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🎬</div>
                    <p>Chưa có suất chiếu nào cho phim này</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seat Selection */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 border border-white/20">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Users className="w-6 h-6 text-green-600" />
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Chọn Ghế Ngồi
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  🎬 Màn hình ở phía dưới. Ghế màu xanh là ghế đã chọn.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Screen */}
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-12 rounded-xl inline-block text-lg font-bold shadow-lg">
                      🎬 MÀN HÌNH 🎬
                    </div>
                  </div>
                  
                  {/* Seat Layout */}
                  <div className="space-y-3 bg-gray-50 p-6 rounded-xl">
                    {seatLayout.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center gap-2">
                        {row.map((seat) => (
                          <button
                            key={seat}
                            onClick={() => handleSeatSelect(seat)}
                            disabled={soldSeats.has(seat)}
                            className={`w-10 h-10 text-sm font-bold rounded-lg border-2 transition-all duration-300 ${
                              soldSeats.has(seat)
                                ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                                : selectedSeats.includes(seat)
                                  ? 'hover:scale-110 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow-lg'
                                  : 'hover:scale-110 bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                            }`}
                          >
                            {seat}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                      <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-lg"></div>
                      <span className="font-medium text-gray-700">Có thể chọn</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                      <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
                      <span className="font-medium text-gray-700">Đã chọn</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 border border-white/20">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Thông Tin Khách Hàng
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Họ và tên *
                    </label>
                    <Input
                      value={customerInfo.name}
                      onChange={(e) => {
                        const value = e.target.value
                        setCustomerInfo({...customerInfo, name: value})
                        validateField('name', value)
                      }}
                      onBlur={(e) => validateField('name', e.target.value)}
                      placeholder="Nhập họ và tên đầy đủ"
                      className={`h-12 text-lg border-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
                        formErrors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📱 Số điện thoại *
                    </label>
                    <Input
                      value={customerInfo.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '') // Chỉ cho phép số
                        setCustomerInfo({...customerInfo, phone: value})
                        validateField('phone', value)
                      }}
                      onBlur={(e) => validateField('phone', e.target.value)}
                      placeholder="Nhập số điện thoại (10 chữ số)"
                      maxLength={10}
                      className={`h-12 text-lg border-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
                        formErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📧 Email *
                    </label>
                    <Input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => {
                        const value = e.target.value
                        setCustomerInfo({...customerInfo, email: value})
                        validateField('email', value)
                      }}
                      onBlur={(e) => validateField('email', e.target.value)}
                      placeholder="Nhập địa chỉ email"
                      className={`h-12 text-lg border-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
                        formErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 shadow-2xl border-0 border border-white/20">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 rounded-t-lg">
                <CardTitle className="text-white text-2xl font-bold text-center">
                  🎫 Tóm Tắt Đặt Vé
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-lg font-semibold text-gray-700">🎬 Phim:</span>
                    <span className="text-lg font-bold text-blue-600">{selectedMovie.title}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-lg font-semibold text-gray-700">🕐 Suất chiếu:</span>
                    <span className="text-lg font-bold text-green-600">
                      {selectedShowtimeText || 'Chưa chọn'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-lg font-semibold text-gray-700">🪑 Ghế ngồi:</span>
                    <span className="text-lg font-bold text-purple-600">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-lg font-semibold text-gray-700">🎟️ Số lượng vé:</span>
                    <span className="text-lg font-bold text-orange-600">{selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl px-4">
                    <span className="text-2xl font-bold text-gray-800">💰 Tổng cộng:</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      {totalPrice.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleBooking}
                  className="w-full mt-8 h-16 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-xl"
                  disabled={!currentSelectedShowtime || selectedSeats.length === 0}
                >
                  🎫 Xác Nhận Đặt Vé
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
