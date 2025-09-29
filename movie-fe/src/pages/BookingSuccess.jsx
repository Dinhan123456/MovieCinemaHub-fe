import React from 'react'

export default function BookingSuccess({ data, onViewHistory, onHome }) {
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
        <div className="text-white">Không có dữ liệu đặt vé. Vui lòng quay lại trang chủ.</div>
      </div>
    )
  }
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="text-3xl font-extrabold text-green-600 mb-6">🎉 Đặt vé thành công!</div>
          <div className="space-y-4 text-gray-800">
            <div className="flex justify-between"><span>Phim</span><span className="font-semibold">{data.movie?.title}</span></div>
            <div className="flex justify-between"><span>Suất chiếu</span><span className="font-semibold">{data.showtime}</span></div>
            <div className="flex justify-between"><span>Ghế</span><span className="font-semibold">{data.seats?.join(', ')}</span></div>
            <div className="flex justify-between"><span>Tổng tiền</span><span className="font-semibold">{data.totalPrice?.toLocaleString('vi-VN')} VNĐ</span></div>
            <div className="flex justify-between"><span>Mã vé</span><span className="font-mono font-bold text-purple-600">{data.bookingCode}</span></div>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={onHome} className="h-12 rounded-lg text-white" style={{background:'linear-gradient(90deg, #8A31AA, #8B8D98)'}}>Về trang chủ</button>
            <button onClick={onViewHistory} className="h-12 rounded-lg border">Xem lịch sử đặt vé</button>
          </div>
        </div>
      </div>
    </div>
  )
}


