import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import MovieDetail from './pages/MovieDetail'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import BookingHistory from './pages/BookingHistory'
import BookingSuccess from './pages/BookingSuccess'
import { AuthAPI } from './api/http'

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

function AppContent() {
  const navigate = useNavigate()
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedShowtime, setSelectedShowtime] = useState(null)

  const handleBookTicket = (movie) => {
    setSelectedMovie(movie)
    navigate(`/movie/${movie.id}`)
  }

  const handleConfirmBooking = (bookingData) => {
    const bookingCode = (bookingData && bookingData.bookingCode)
      ? bookingData.bookingCode
      : Math.random().toString(36).substr(2, 9).toUpperCase()
    
    // Lưu booking vào localStorage để demo (thay vì gửi lên server)
    const newBooking = {
      id: Date.now(),
      bookingCode: bookingCode,
      movie: bookingData.movie,
      showtime: bookingData.showtime,
      seats: bookingData.seats,
      totalPrice: bookingData.totalPrice,
      customerName: bookingData.customer.name,
      customerEmail: bookingData.customer.email,
      customerPhone: bookingData.customer.phone,
      bookingDate: new Date().toISOString(),
      status: 'CONFIRMED'
    }
    
    // Lấy danh sách booking hiện tại
    const username = AuthAPI.getUsername() || 'guest'
    const key = `userBookings:${username}`
    const existingBookings = JSON.parse(localStorage.getItem(key) || '[]')
    existingBookings.push(newBooking)
    localStorage.setItem(key, JSON.stringify(existingBookings))
    // Điều hướng đến trang thành công (không dùng alert)
    navigate('/booking-success', { state: newBooking })
  }

  const isAuthed = !!AuthAPI.getToken()
  const username = AuthAPI.getUsername()
  const roles = JSON.parse(localStorage.getItem('roles') || '[]')

  // Toast minimal
  const [toasts, setToasts] = useState([])
  const pushToast = (text) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t)=>[...t,{ id, text }])
    setTimeout(()=> setToasts((t)=> t.filter(x=>x.id!==id)), 2500)
  }

  return (
    <div className="App">
      {/* Header đẹp */}
      <header className="sticky top-0 z-50 backdrop-blur-md shadow-sm" style={{ backgroundColor: 'rgba(20,16,24,0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center" style={{ background: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>C</div>
              <button onClick={()=>navigate('/')} className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>CinemaHub</button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={()=>navigate('/')} className="px-3 py-1.5 text-sm rounded-lg border-2 transition" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#8B8D98' }}>Trang chủ</button>
              {isAuthed && (
                <button onClick={()=>navigate('/booking-history')} className="px-3 py-1.5 text-sm rounded-lg border-2 transition" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#8B8D98' }}>Lịch sử đặt vé</button>
              )}
              {isAuthed && roles.includes('ROLE_ADMIN') && (
                <button onClick={()=>navigate('/admin')} className="px-3 py-1.5 text-sm rounded-lg text-white shadow hover:shadow-md transition" style={{ background: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>Admin</button>
              )}
              {!isAuthed && (
                <>
                  <button onClick={()=>navigate('/login')} className="px-3 py-1.5 text-sm rounded-lg border-2 transition" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#8B8D98' }}>Đăng nhập</button>
                  <button onClick={()=>navigate('/register')} className="px-3 py-1.5 text-sm rounded-lg text-white shadow hover:shadow-md transition" style={{ background: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>Đăng ký</button>
                </>
              )}
              {isAuthed && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#8B8D98' }}>
                    <span className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>{(username||'U').slice(0,1).toUpperCase()}</span>
                    <span className="font-medium">{username}</span>
                  </div>
                  <button onClick={()=>{AuthAPI.logout(); pushToast('Đăng xuất thành công'); navigate('/login')}} className="px-3 py-1.5 text-sm rounded-lg border-2 transition" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#8B8D98' }}>Đăng xuất</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={
          <HomePage 
            onBookTicket={handleBookTicket} 
            isAuthed={isAuthed}
            onRequireLogin={()=>navigate('/login')}
          />
        } />
        
        <Route path="/admin" element={<Admin />} />
        
        <Route path="/movie/:id" element={<MovieDetailWrapper />} />
        
        <Route path="/booking" element={<BookingPageWrapper />} />
        <Route path="/booking-success" element={<BookingSuccessWrapper />} />
        
        <Route path="/booking-history" element={
          <BookingHistory onBack={()=>navigate('/')} />
        } />
        
        <Route path="/login" element={
          <Login onSuccess={()=>{ pushToast('Đăng nhập thành công'); navigate('/') }} />
        } />
        
        <Route path="/register" element={
          <Register onSuccess={()=>{ pushToast('Đăng ký thành công, vui lòng đăng nhập'); navigate('/login') }} />
        } />
      </Routes>

      {/* Toast Container */}
      <div className="fixed top-16 right-4 z-[9999] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className="px-4 py-2 rounded-lg text-sm text-white shadow-lg" style={{ background:'linear-gradient(90deg, #8A31AA, #8B8D98)'}}>{t.text}</div>
        ))}
      </div>
    </div>
  )
}

// Wrapper component để lấy movieId từ URL params
function MovieDetailWrapper() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const handleBack = () => {
    console.log('Back button clicked') // Debug log
    navigate('/', { replace: true })
  }
  
  return (
    <MovieDetail 
      movieId={parseInt(id)}
      onSelectShowtime={(st, list, movie) => { 
        // Cần lưu selectedShowtime vào state hoặc context
        navigate('/booking', { state: { showtime: st, list, movie } })
      }}
      onBack={handleBack}
    />
  )
}

// Wrapper component để lấy dữ liệu từ location state
function BookingPageWrapper() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Lấy dữ liệu từ location state
  const selectedMovie = location.state?.movie
  const selectedShowtime = location.state?.showtime
  
  const handleBack = () => {
    navigate(-1)
  }
  
  const handleConfirmBooking = (bookingData) => {
    const bookingCode = Math.random().toString(36).substr(2, 9).toUpperCase()
    const newBooking = {
      id: Date.now(),
      bookingCode,
      movie: bookingData.movie,
      showtime: bookingData.showtime,
      seats: bookingData.seats,
      totalPrice: bookingData.totalPrice,
      customerName: bookingData.customer.name,
      customerEmail: bookingData.customer.email,
      customerPhone: bookingData.customer.phone,
      bookingDate: new Date().toISOString(),
      status: 'CONFIRMED'
    }
    const username = AuthAPI.getUsername() || 'guest'
    const key = `userBookings:${username}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    existing.push(newBooking)
    localStorage.setItem(key, JSON.stringify(existing))
    navigate('/booking-success', { state: newBooking })
  }
  
  return (
    <BookingPage 
      selectedMovie={selectedMovie}
      selectedShowtime={selectedShowtime}
      onBack={handleBack}
      onConfirmBooking={handleConfirmBooking}
    />
  )
}

export default App

// Wrapper cho trang thành công: đọc state, nếu thiếu thì quay về /
function BookingSuccessWrapper() {
  const navigate = useNavigate()
  const location = useLocation()
  const data = location.state
  return (
    <BookingSuccess 
      data={data}
      onHome={() => navigate('/')}
      onViewHistory={() => navigate('/booking-history')}
    />
  )
}