import React, { useState } from 'react'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import MovieDetail from './pages/MovieDetail'
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
                  <button onClick={()=>{AuthAPI.logout(); setCurrentPage('home')}} className="px-3 py-1.5 text-sm rounded-lg border-2 transition" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#8B8D98' }}>Đăng xuất</button>
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
      {currentPage === 'detail' && selectedMovie && (
        <MovieDetail 
          movieId={selectedMovie.id}
          onSelectShowtime={(st, list)=>{ setSelectedShowtime({...st, list}); setCurrentPage('booking'); }}
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
        <Login onSuccess={()=>setCurrentPage('home')} />
      )}
      {currentPage === 'register' && (
        <Register onSuccess={()=>setCurrentPage('home')} />
      )}
    </div>
  )
}

export default App