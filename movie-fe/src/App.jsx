import React, { useState } from 'react'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import MovieDetail from './pages/MovieDetail'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthAPI } from './api/http'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [selectedShowtime, setSelectedShowtime] = useState(null)

  const handleBookTicket = (movie) => {
    setSelectedMovie(movie)
    setCurrentPage('detail')
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
    setSelectedMovie(null)
  }

  const handleConfirmBooking = (bookingData) => {
    // Hiển thị thông tin đặt vé thành công
    alert(`Đặt vé thành công!\n\nPhim: ${bookingData.movie.title}\nSuất chiếu: ${bookingData.showtime}\nGhế: ${bookingData.seats.join(', ')}\nTổng tiền: ${bookingData.totalPrice.toLocaleString('vi-VN')} VNĐ\n\nMã vé: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`)
    
    // Quay về trang chủ
    handleBackToHome()
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
              <button onClick={()=>setCurrentPage('home')} className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>CinemaHub</button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={()=>setCurrentPage('home')} className="px-3 py-1.5 text-sm rounded-lg border-2 transition" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#8B8D98' }}>Trang chủ</button>
              {isAuthed && roles.includes('ROLE_ADMIN') && (
                <button onClick={()=>setCurrentPage('admin')} className="px-3 py-1.5 text-sm rounded-lg text-white shadow hover:shadow-md transition" style={{ background: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>Admin</button>
              )}
              {!isAuthed && (
                <>
                  <button onClick={()=>setCurrentPage('login')} className="px-3 py-1.5 text-sm rounded-lg border-2 transition" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#8B8D98' }}>Đăng nhập</button>
                  <button onClick={()=>setCurrentPage('register')} className="px-3 py-1.5 text-sm rounded-lg text-white shadow hover:shadow-md transition" style={{ background: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>Đăng ký</button>
                </>
              )}
              {isAuthed && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#8B8D98' }}>
                    <span className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(90deg, #8A31AA, #8B8D98)' }}>{(username||'U').slice(0,1).toUpperCase()}</span>
                    <span className="font-medium">{username}</span>
                  </div>
                  <button onClick={()=>{AuthAPI.logout(); pushToast('Đăng xuất thành công'); setCurrentPage('login')}} className="px-3 py-1.5 text-sm rounded-lg border-2 transition" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#8B8D98' }}>Đăng xuất</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {currentPage === 'home' && (
        <HomePage 
          onBookTicket={handleBookTicket} 
          isAuthed={isAuthed}
          onRequireLogin={()=>setCurrentPage('login')}
        />
      )}
      {currentPage === 'admin' && (
        <Admin />
      )}
      {currentPage === 'detail' && selectedMovie && (
        <MovieDetail 
          movieId={selectedMovie.id}
          onSelectShowtime={(st, list)=>{ setSelectedShowtime({...st, list}); setCurrentPage('booking'); }}
          onBack={()=>setCurrentPage('home')}
        />
      )}
      {currentPage === 'booking' && selectedMovie && selectedShowtime && (
        <BookingPage 
          selectedMovie={selectedMovie}
          selectedShowtime={selectedShowtime}
          onBack={()=>setCurrentPage('detail')}
          onConfirmBooking={handleConfirmBooking}
        />
      )}
      {currentPage === 'login' && (
        <Login onSuccess={()=>{ pushToast('Đăng nhập thành công'); setCurrentPage('home') }} />
      )}
      {currentPage === 'register' && (
        <Register onSuccess={()=>{ pushToast('Đăng ký thành công, vui lòng đăng nhập'); setCurrentPage('login') }} />
      )}

      {/* Toast Container */}
      <div className="fixed top-16 right-4 z-[9999] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className="px-4 py-2 rounded-lg text-sm text-white shadow-lg" style={{ background:'linear-gradient(90deg, #8A31AA, #8B8D98)'}}>{t.text}</div>
        ))}
      </div>
    </div>
  )
}

export default App